const express = require("express");
const router=express.Router();
const {createAlert,getMyAlerts}=require("../controllers/alertControllers")
const {authMiddleware}=require("../middleware/authMiddleware")


// creating sos alert
router.post("/",authMiddleware,createAlert)


// get all alerts
router.get("/my",authMiddleware,getMyAlerts);



module.exports=router