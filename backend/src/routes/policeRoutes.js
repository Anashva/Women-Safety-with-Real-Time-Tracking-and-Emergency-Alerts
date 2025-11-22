const {getDashboardData,heartbeat,autoLogin,getAssignedAlerts,registerPolice,loginPolice}=require('../controllers/policeController')
const express = require("express");
const router = express.Router();
const stationAuth = require("../middleware/stationAuth");

router.post("/register", registerPolice);
router.post("/login", loginPolice);

router.post("/autologin", autoLogin);

router.post("/heartbeat", stationAuth, heartbeat);

router.get("/dashboard", stationAuth, getDashboardData);

router.get("/alerts", stationAuth, getAssignedAlerts);



module.exports = router;