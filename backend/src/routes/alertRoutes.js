const express = require("express");
const router=express.Router();
const {createAlert,getMyAlerts,acknowledgeAlert,uploadFields,getAllAlertsForPolice}=require("../controllers/alertControllers")
const {authMiddleware}=require("../middleware/authMiddleware")
const Alert=require('../models/Alert')



// creating sos alert
router.post("/",authMiddleware,uploadFields,createAlert)




// get all alerts
router.get("/my",authMiddleware,getMyAlerts);


// get all alerts (for police dashboard)
router.get("/all", async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("nearestPoliceId", "name location status")
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

//  route to acknowledge an alert
router.post("/acknowledge/:id", authMiddleware, acknowledgeAlert);


module.exports=router