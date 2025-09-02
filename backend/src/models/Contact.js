const mongoose=require("mongoose");
const contactSchema=new mongoose.Schema({
    userid:{
   type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true   
    },
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
}


},{timestamps:true})
let contact=mongoose.model('Contact',contactSchema)
module.exports=contact
