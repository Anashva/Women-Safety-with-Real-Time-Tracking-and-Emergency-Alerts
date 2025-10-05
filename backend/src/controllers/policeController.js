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
    res.status(201).json({ message: "Police station registered successfully!" });
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

    const token = jwt.sign({ id: station._id }, "secretKey", { expiresIn: "7d" });

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

// =========================
// 🧩 Export All
// =========================
module.exports = {
  registerPolice,
  loginPolice,
  autoLogin,
  heartbeat,
  getDashboardData,
  getAssignedAlerts,
};
