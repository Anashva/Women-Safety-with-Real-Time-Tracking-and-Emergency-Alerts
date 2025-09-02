const Alert = require("../models/Alert");

const createAlert = async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Location (lat, lng) is required" });
    }

    const newAlert = new Alert({
      userId: userId || null,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      status: "pending",
    });

    await newAlert.save();

    res.status(201).json({
      message: "🚨 Alert created successfully",
      alertId: newAlert._id,
      alert: newAlert,
    });
  } catch (err) {
    console.error("Error creating alert:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate(
      "userId nearestPoliceId notifiedContacts"
    );
    res.json(alerts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching alerts", error: err.message });
  }
};

const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const alert = await Alert.findByIdAndUpdate(id, { status }, { new: true });

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json({ message: "Status updated", alert });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating alert", error: err.message });
  }
};

module.exports = { createAlert, getAlerts, updateAlertStatus };
