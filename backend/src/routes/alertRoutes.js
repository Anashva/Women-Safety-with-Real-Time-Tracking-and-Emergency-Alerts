const express = require("express");
const router=express.Router();


const {createAlert,getMyAlerts,acknowledgeAlert}=require("../controllers/alertControllers")
const {authMiddleware}=require("../middleware/authMiddleware")
const Alert=require('../models/Alert')

router.post("/",authMiddleware,createAlert)

router.get("/my",authMiddleware,getMyAlerts);

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

// alertRoutes.js

router.post("/acknowledge/:id", authMiddleware, acknowledgeAlert);


module.exports=router

