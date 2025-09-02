const express = require("express");
const {
  registerUser,
  loginUser,
 
  updateProfile,
  changePassword,

} =require('../controllers/userController.js');


const { protect, adminOnly } = require("../middleware/authMiddleware.js");

const router = express.Router();

// 👉 Authentication
router.post("/register", registerUser);   
router.post("/login", loginUser);         

router.put("/profile", protect, updateProfile);   
router.put("/password", protect, changePassword);  


module.exports = router;
