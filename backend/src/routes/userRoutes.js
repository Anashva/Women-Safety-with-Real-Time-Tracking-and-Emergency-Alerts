const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router=express.Router();






// register for new user
router.post('/register',registerUser);

// login for registered user
router.post('/login',loginUser);


// profile for logged in user
router.get('/profile',authMiddleware,getUserProfile);


















module.exports=router;

