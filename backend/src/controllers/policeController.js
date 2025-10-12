const PoliceStation = require("../models/PoliceStation");
const jwt = require("jsonwebtoken");
const Alert=require('../models/Alert');
const bcrypt=require('bcryptjs')


// =========================
// 🟢 Register a Police Station
// =========================
const registerPolice = async (req, res) => {
  try {
    const { name, username, password, location } = req.body;

    // check if username already exists
    const existing = await PoliceStation.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPolice = new PoliceStation({
      name,
      username,
      password: hashedPassword,
      location,
      status: "offline",
    });

    await newPolice.save();
res.status(201).json({
  message: "Police station registered successfully!",
  station: newPolice, // frontend ko required data milega
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 🟠 Login Police
// =========================
const loginPolice = async (req, res) => {
  try {
    const { username, password } = req.body;

    const station = await PoliceStation.findOne({ username });
    if (!station) {
      return res.status(404).json({ message: "Police station not found" });
    }

    const isMatch = await bcrypt.compare(password, station.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: station._id },  process.env.JWT_SECRET, { expiresIn: "7d" });

    // update status on login
    station.status = "online";
    station.lastHeartbeat = new Date();
    await station.save();

    res.json({ message: "Login successful", token, station });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 🟣 Auto Login
// =========================
const autoLogin = async (req, res) => {
  try {
    const { username } = req.body;
    let station = await PoliceStation.findOne({ username });

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    const token = jwt.sign({ id: station._id }, "secretKey", { expiresIn: "7d" });
    station.autoToken = token;
    station.status = "online";
    station.lastHeartbeat = new Date();
    await station.save();

    res.json({ message: "Auto login successful", token, station });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 🔵 Heartbeat
// =========================
const heartbeat = async (req, res) => {
  try {
    const stationId = req.user.id;
    const station = await PoliceStation.findById(stationId);
    station.lastHeartbeat = new Date();
    station.status = "online";
    await station.save();
    res.json({ message: "Heartbeat received" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 🟡 Dashboard Data
// =========================
const getDashboardData = async (req, res) => {
  try {
    const station = await PoliceStation.findById(req.user.id);
    res.json({ station });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 🔴 Get Assigned Alerts
// =========================
const getAssignedAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ nearestPoliceId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "fullName phone");
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// In your policeController.js (acknowledgeAlert)
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.acknowledged = true;
    alert.status = "resolved";
    await alert.save();

    const io = req.app.get("io");

    if (io && alert.user) {
      // 1️⃣ Notify the user with a toast
      io.to(alert.user.toString()).emit("alertAcknowledged", {
        message: "✅ Your SOS alert has been acknowledged by police",
        alert,
      });

      // 2️⃣ Update the alert status in user table
      io.to(alert.user.toString()).emit("alertStatusUpdate", {
        alertId: alert._id,
        status: alert.status,
      });
    }

    res.json({ success: true, alert });
  } catch (error) {
    console.error("Acknowledge error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================
// 🧩 Export All
// =========================
module.exports = {
  registerPolice,
  loginPolice,
  autoLogin,
  heartbeat,
  getDashboardData,
  getAssignedAlerts, acknowledgeAlert
};
