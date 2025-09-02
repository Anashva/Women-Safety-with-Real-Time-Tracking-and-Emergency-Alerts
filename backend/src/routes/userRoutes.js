const express = require("express");
const {
  getUserProfile,
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,     // (optional, admin ke liye)
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

// const { protect, adminOnly } = require("../middleware/authMiddleware.js");

const router = express.Router();

// 👉 Authentication
router.post("/register", registerUser);   // User register karega
router.post("/login", loginUser);         // Login
// router.post("/logout", protect, logoutUser); // Logout

// 👉 Profile
router.get("/profile", authMiddleware, getUserProfile);       // Apna profile dekhna
// router.put("/profile", protect, updateProfile);    // Profile update
// router.put("/password", protect, changePassword);  // Password change
// router.delete("/delete", protect, deleteAccount);  // Account delete

// 👉 Admin only routes
// router.get("/", protect, adminOnly, getAllUsers);  // All users list





module.exports = router;
