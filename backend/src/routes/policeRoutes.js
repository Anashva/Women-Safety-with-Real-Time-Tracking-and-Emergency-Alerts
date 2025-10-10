const {getDashboardData,heartbeat,autoLogin,getAssignedAlerts,registerPolice,loginPolice}=require('../controllers/policeController')
const express = require("express");
const router = express.Router();
const stationAuth = require("../middleware/stationAuth");



// Register & Login
router.post("/register", registerPolice);
router.post("/login", loginPolice);

// Auto login
router.post("/autologin", autoLogin);

// Heartbeat
router.post("/heartbeat", stationAuth, heartbeat);

// Dashboard data
router.get("/dashboard", stationAuth, getDashboardData);

// Assigned alerts
router.get("/alerts", stationAuth, getAssignedAlerts);



module.exports = router;