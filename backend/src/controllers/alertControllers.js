const Alert = require("../models/Alert");
const PoliceStation = require('../models/PoliceStation');
const User = require("../models/User");
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// ------------------ DISTANCE FUNCTION ------------------
const calcDistance = (lat1, lon1, lat2, lon2) => {
  return Math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2);
};


// Create uploads directory
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

const uploadFields = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

// creating sos alert
const createAlert = async (req, res) => {
  try {
    const { latitude, longitude, message, alertType } = req.body;
    if (!latitude || !longitude)
      return res.status(400).json({ message: "Latitude & Longitude required" });

    const user = await User.findById(req.user._id).select("fullName phone email contacts");
    if (!user) return res.status(404).json({ message: "User not found" });


    // let nearestPolice = await PoliceStation.findOne({
    //   status: "online",
    //   location: {
    //     $near: {
    //       $geometry: {
    //         type: "Point",
    //         coordinates: [longitude, latitude]
    //       },
    //       $maxDistance: 5000
    //     }
    //   }
    // });

    // if (!nearestPolice) {
    //   nearestPolice = await PoliceStation.findOne({ status: "online" });
    // }

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



    const evidence = {
      message: message || "SOS Triggered",
      photos: [],
      voiceNotes: []
    };


    if (req.files && req.files.video) {
  const videoFile = req.files.video[0];
  evidence.videoUrl = `/uploads/${videoFile.filename}`;
  console.log('Video saved:', videoFile.filename); // Debug log
  }

  if (req.files && req.files.audio) {
  const audioFile = req.files.audio[0];
  evidence.audioUrl = `/uploads/${audioFile.filename}`;
  console.log('Audio saved:', audioFile.filename); // Debug log
  }

    // if (req.files && req.files.video) {
    //   evidence.videoUrl = `/uploads/${req.files.video[0].filename}`;
    // }

    // if (req.files && req.files.audio) {
    //   evidence.audioUrl = `/uploads/${req.files.audio[0].filename}`;
    // }

    const alert = await Alert.create({
      user: user._id,
      location: { type: "Point", coordinates: [longitude, latitude] },
      userSnapshot: {
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      },
      contactsSnapshot: user.contacts.map((c) => ({ name: c.name, phone: c.phone })),
      nearestPoliceId: nearestPolice ? nearestPolice._id : null,
      evidence: evidence,
      alertType: alertType || 'message',
      status: "pending",
      acknowledged: false,
    });

    if (nearestPolice) {
      alert.nearestPoliceId = nearestPolice._id;
      await alert.save();
    }

    const io = req.app.get("io");
    // if (io) {
    //   io.to("onlinePolice").emit("newAlert", alert);
    //   io.to(user._id.toString()).emit("newUserAlert", alert);
    // }


    // res.status(201).json({
    //   message: "SOS Alert created",
    //   alert,
    //   nearestPolice: nearestPolice ? nearestPolice.name : "No station found nearby"
    // });
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.acknowledged = true;
    alert.status = "resolved";
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
      // io.to(alert.user.toString()).emit("alertAcknowledged", {
      //   message: "✅ Your SOS alert has been acknowledged by police",
      //   alert,
      // });
    }
    if (io && alert.nearestPoliceId && global.activePoliceSockets?.[alert.nearestPoliceId]) {
      global.activePoliceSockets[alert.nearestPoliceId].forEach(socketId => {
        io.to(socketId).emit("alertHandled", alert);
      });
    }

    res.json({ success: true, alert });
  } catch (error) {
    console.error("Acknowledge error:", error);
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

module.exports = { createAlert, getMyAlerts, acknowledgeAlert, uploadFields ,getAllAlertsForPolice};