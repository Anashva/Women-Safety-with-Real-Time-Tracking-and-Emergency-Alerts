const Alert = require("../models/Alert");
const PoliceStation=require('../models/PoliceStation');
const User = require("../models/User");



// creating sos alert
const createAlert = async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;
    const user = await User.findById(req.user._id).select("fullName phone email contacts");;

    // Find nearest online police
    const nearestPolice = await PoliceStation.findOne({
      status: "online",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000 // 5 km radius
        }
      }
    });

    if (!nearestPolice) {
      nearestPolice = await PoliceStation.findOne({ status: "online" });
    }

    // Create alert
    const alert = await Alert.create({
      user: user._id,
      location: { type: "Point", coordinates: [longitude, latitude] },
      userSnapshot: {
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      },
      contactsSnapshot: user.contacts.map((c)=> ({ name: c.name, phone: c.phone })),
      nearestPoliceId: nearestPolice ? nearestPolice._id : null,
      evidence: { message: message || "SOS Triggered" },
    });
  


    if (nearestPolice) {
      alert.nearestPoliceId = nearestPolice._id;
      await alert.save(); //  Save updated alert with nearest police info
    }

    //  Send real-time notification to all online police
    const io = req.app.get("io"); // Access Socket.io instance from app
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
// Advantage: Even if user updates profile later, the alert still keeps old snapshot.




// sare alert honge jo jab user login hoga

 const getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });//newest alert sbse pehle aaega
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};




//  Acknowledge alert
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.acknowledged = true;
    alert.status = "resolved";
    await alert.save();

    // ✅ Emit socket event to the specific user who created the alert
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


module.exports = { createAlert, getMyAlerts,acknowledgeAlert}