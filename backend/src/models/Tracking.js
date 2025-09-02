const mongoose=require("mongoose");
const trackingSchema=new mongoose.Schema({
    alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alert",   // reference to Alert schema
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true // each token must be unique
  },
  expiry: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }



},{timestamps:true})
let tracking=mongoose.model('Tracking',trackingSchema)
module.exports=tracking
