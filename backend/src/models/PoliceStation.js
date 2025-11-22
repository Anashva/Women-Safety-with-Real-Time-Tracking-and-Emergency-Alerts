const mongoose = require("mongoose");

const policeStationSchema = new mongoose.Schema({
  name: { type: String, required: true },

location: {       
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], 
      required: true,
    },
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },  
  autoToken: { type: String }, 
  status: { type: String, enum: ["online", "offline", "busy"], default: "offline" },
  lastHeartbeat: { type: Date }
});


policeStationSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("PoliceStation", policeStationSchema);
