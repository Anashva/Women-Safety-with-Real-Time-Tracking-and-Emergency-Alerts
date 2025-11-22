
const Alert = require("../models/Alert");
const PoliceStation = require("../models/PoliceStation");
const User = require("../models/User");

// ------------------ DISTANCE FUNCTION ------------------
const calcDistance = (lat1, lon1, lat2, lon2) => {
  return Math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2);
};

// ------------------ CREATE ALERT + AUTO ESCALATION ------------------
const createAlert = async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;
    if (!latitude || !longitude)
      return res.status(400).json({ message: "Latitude & Longitude required" });

    const user = await User.findById(req.user._id).select(
      "fullName phone email contacts"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const onlinePolice = await PoliceStation.find({ status: "online" });
    if (!onlinePolice.length) console.log("No online police stations found");

    // ------------------ PICK NEAREST POLICE ------------------
    let nearestPolice = null;
    let minDistance = Infinity;

    onlinePolice.forEach((station) => {
      if (!station.location?.coordinates) return;
      const [policeLon, policeLat] = station.location.coordinates;
      const dist = calcDistance(latitude, longitude, policeLat, policeLon);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPolice = station;
      }
    });

    console.log("Nearest Police →", nearestPolice ? nearestPolice.name : "None");

    const alert = await Alert.create({
      user: user._id,
      location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
      userSnapshot: { fullName: user.fullName || "", phone: user.phone || "", email: user.email || "" },
      contactsSnapshot: (user.contacts || []).map((c) => ({ name: c.name, phone: c.phone })),
      nearestPoliceId: nearestPolice ? nearestPolice._id : null,
      evidence: { message: message || "SOS Triggered" },
      status: "pending",
      acknowledged: false,
    });

    const io = req.app.get("io");

    // ------------------ EMIT TO ALL POLICE SOCKETS ------------------
    if (io && nearestPolice && global.activePoliceSockets?.[nearestPolice._id]) {
      global.activePoliceSockets[nearestPolice._id].forEach(socketId => {
        io.to(socketId).emit("newAlert", alert);
      });
    }

    // ------------------ EMIT TO ALL USER SOCKETS ------------------
    if (io && global.activeUserSockets?.[user._id]) {
      global.activeUserSockets[user._id].forEach(socketId => {
        io.to(socketId).emit("newUserAlert", alert);
      });
    }

    // ------------------ AUTO ESCALATION AFTER 1 MIN ------------------
    setTimeout(async () => {
      const latestAlert = await Alert.findById(alert._id);
      if (!latestAlert || latestAlert.acknowledged) return;

      const onlinePolice2 = await PoliceStation.find({ status: "online" });
      if (!onlinePolice2.length) return;

      const currentPoliceId = latestAlert.nearestPoliceId?.toString();

      let nextPolice = null;
      let minDist = Infinity;

      onlinePolice2.forEach((station) => {
        if (!station.location?.coordinates) return;
        const [lon, lat] = station.location.coordinates;
        const [alertLon, alertLat] = latestAlert.location.coordinates;
        const dist = calcDistance(alertLat, alertLon, lat, lon);
        if (station._id.toString() !== currentPoliceId && dist < minDist) {
          minDist = dist;
          nextPolice = station;
        }
      });

      if (!nextPolice) {
        nextPolice = onlinePolice2.find(p => p._id.toString() === currentPoliceId) || onlinePolice2[0];
      }

      console.log("Escalating to →", nextPolice ? nextPolice.name : "None");

      // ------------------ REMOVE ALERT FROM OLD POLICE SOCKETS ------------------
      if (io && currentPoliceId && currentPoliceId !== nextPolice._id.toString() && global.activePoliceSockets?.[currentPoliceId]) {
        global.activePoliceSockets[currentPoliceId].forEach(socketId => {
          io.to(socketId).emit("alertRemoved", { alertId: latestAlert._id });
        });
      }

      // ------------------ SEND ALERT TO NEXT POLICE SOCKETS ------------------
      if (io && global.activePoliceSockets?.[nextPolice._id]) {
        global.activePoliceSockets[nextPolice._id].forEach(socketId => {
          io.to(socketId).emit("newAlert", latestAlert);
        });
      }

      latestAlert.nearestPoliceId = nextPolice._id;
      await latestAlert.save();

    }, 1 * 60 * 1000); // 1 minute

    res.status(201).json({
      message: nearestPolice ? "SOS alert sent to nearest police" : "SOS created but no police online",
      alert,
      nearestPolice: nearestPolice?.name || null,
      distance: nearestPolice ? `${minDistance.toFixed(2)} units` : null,
    });

  } catch (error) {
    console.error("CreateAlert Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ USER ALERTS ------------------
const getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

// ------------------ ACKNOWLEDGE ALERT ------------------
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.status = "resolved";
    alert.acknowledged = true;
    await alert.save();

    const io = req.app.get("io");

    if (io && global.activeUserSockets?.[alert.user]) {
      global.activeUserSockets[alert.user].forEach(socketId => {
        io.to(socketId).emit("alertAcknowledged", {
          message: "Your SOS alert has been handled",
          alertId: alert._id,
          status: alert.status,
        });
      });
    }

    if (io && alert.nearestPoliceId && global.activePoliceSockets?.[alert.nearestPoliceId]) {
      global.activePoliceSockets[alert.nearestPoliceId].forEach(socketId => {
        io.to(socketId).emit("alertHandled", alert);
      });
    }

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ POLICE DASHBOARD ALERTS ------------------
const getAllAlertsForPolice = async (req, res) => {
  try {
    const policeId = req.user.id;
    const alerts = await Alert.find({ nearestPoliceId: policeId })
      .sort({ createdAt: -1 })
      .populate("user", "fullName phone email");

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAlert,
  getMyAlerts,
  acknowledgeAlert,
  getAllAlertsForPolice,
};
