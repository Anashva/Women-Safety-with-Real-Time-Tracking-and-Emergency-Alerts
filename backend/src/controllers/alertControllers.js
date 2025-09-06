const Alert = require("../models/Alert");




// creating sos alert
const createAlert = async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;

    // Full user details from authMiddleware (req.user me already aa chuka hai)
    const user = req.user;

    const alert = await Alert.create({
      user: user._id,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      userSnapshot: {
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      },
      contactsSnapshot: user.contacts.map((c) => ({
        name: c.name,
        phone: c.phone,
      })),
      evidence: {
        message: message || "SOS Triggered", // agar frontend se message bheja to
      },
    });

    res.status(201).json({ message: "SOS Alert created", alert });
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