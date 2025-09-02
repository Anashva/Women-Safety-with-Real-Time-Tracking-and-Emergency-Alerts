const User=require('../models/User');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')





// new user register
const registUser=async (req,res)=>{
  try{
    const {name,phone,email,password,emergencyContacts}=req.body;

    // validation agr user exist kar rha h
    const validate=await User.findOne({email});
    if(validate){
      return res.status(400).json({msg:"User already exists"});
    }

    // hash password

    const hashedPassword=await bcrypt.hash(password,10); //salt length to generate

    const use=new User({
      name,
      phone,
      email,
      password: hashedPassword,
      emergencyContacts,

    })
    await user.save();

    res.status(201).json({msg:"User registered successfully"})
  }
  catch (err) {
    res.status(500).json({ msg: err.message });
  }
};







// login registered user
const loginUser=async (req,res)=>{
  try{
    const {name ,password}=req.body;
    const user=await User.findOne({name:name});
    // agar user
    if(!user){
      return res.status(400).json({msg:"Invalid credentials"});
    }
// user k password ko compare karenge
    const isMatch=await bcrypt.compare(paasword,user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }


    // ham jwt token generate karenge
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
      expiresIn:"7d",
    });

     res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone },
    });
  }
    catch (err) {
    res.status(500).json({ msg: err.message });
  }

  }





// Get user profile (protected)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};













module.exports={registUser,loginUser,getUserProfile};