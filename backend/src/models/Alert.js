const mongoose=require("mongoose");
const alertSchema=new mongoose.Schema({
  userid:{
     type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true
    },

location: {
    type: {
      type: String,
      enum: ["Point"], // GeoJSON type must be "Point"
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
time: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    default: "pending"
  },
  nearestPoliceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Police" // references Police schema
  },
  notifiedContacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact"
    }
  ]
}


,{timestamps:true})
alertSchema.index({ location: "2dsphere" })
let alert=mongoose.model('Alert',alertSchema)
module.exports=alert
