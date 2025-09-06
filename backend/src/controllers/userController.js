const User=require('../models/User'); 
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')




// JWT generate function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};




// Register User
const registerUser = async (req, res) => {
  try {
    const { fullName, phone, email, password, contacts } = req.body;
     // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    // Check if user already exists
    const userExists = await User.findOne({email});
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      phone,
      email,
      password: hashedPassword,
      contacts,
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// Login User
 const loginUser = async (req, res) => {
  try {
    const {name, password } = req.body; 

    const user = await User.findOne({ fullName:name});// yha change h name wlw mein

    // user ko check krenge agr vo hai to token generate krenge
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        token: generateToken(user._id),
      });
    } else {
 
      
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};












// Get User Profile only when logged in
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





module.exports={registerUser,loginUser,getUserProfile}