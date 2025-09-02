const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
name:{
    type:String,
    trim:true,
    required:true
},

phone:{
    type:String,
   validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // must be exactly 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    },
    required:true
},
email:{
    type:String,
    trim:true,
    required:true,
     validate: {
    validator: function (v) {
      return /^\S+@\S+\.\S+$/.test(v);
    },
    message: props => `${props.value} is not a valid email address!`
  }
},
password:{
  type:String,
  trim:true,
   required:true
},
role: {
      type: String,
      enum: ["user"], // ✅ only 2 roles allowed
      default: "user",
    },
contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact"
    }
  ]
},{timestamps:true})
let user=mongoose.model('User',userSchema)
module.exports=user
