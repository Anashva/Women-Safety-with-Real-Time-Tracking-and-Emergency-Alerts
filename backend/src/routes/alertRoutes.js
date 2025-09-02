const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAlerts,
  updateAlertStatus,
} = require("../controllers/alertControllers");

// Route: Create new SOS alert
router.post("/create", createAlert);

// Route: Get all alerts (for testing or police dashboard)
router.get("/", getAlerts);

// Route: Update alert status (police can mark as in-progress/resolved)
router.put("/:id/status", updateAlertStatus);

module.exports = router;
