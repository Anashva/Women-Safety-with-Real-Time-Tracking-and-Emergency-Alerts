const Alert = require("../models/Alert");
const PoliceStation = require('../models/PoliceStation');
const User = require("../models/User");
const multer = require('multer');
const path = require('path');
const fs = require('fs');



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
    const user = await User.findById(req.user._id).select("fullName phone email contacts");

    let nearestPolice = await PoliceStation.findOne({
      status: "online",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000
        }
      }
    });

    if (!nearestPolice) {
      nearestPolice = await PoliceStation.findOne({ status: "online" });
    }

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
      alertType: alertType || 'message'
    });

    if (nearestPolice) {
      alert.nearestPoliceId = nearestPolice._id;
      await alert.save();
    }

    const io = req.app.get("io");
    if (io) {
      io.to("onlinePolice").emit("newAlert", alert);
      io.to(user._id.toString()).emit("newUserAlert", alert);
    }

    res.status(201).json({
      message: "SOS Alert created",
      alert,
      nearestPolice: nearestPolice ? nearestPolice.name : "No station found nearby"
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
    if (io && alert.user) {
      io.to(alert.user.toString()).emit("alertAcknowledged", {
        message: "✅ Your SOS alert has been acknowledged by police",
        alert,
      });
    }

    res.json({ success: true, alert });
  } catch (error) {
    console.error("Acknowledge error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createAlert, getMyAlerts, acknowledgeAlert, uploadFields };