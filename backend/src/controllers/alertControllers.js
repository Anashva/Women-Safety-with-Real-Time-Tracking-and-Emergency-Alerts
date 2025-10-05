const Alert = require("../models/Alert");
const PoliceStation=require('../models/PoliceStation');




// creating sos alert
const createAlert = async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;
    const user = req.user;

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










module.exports = { createAlert, getMyAlerts}