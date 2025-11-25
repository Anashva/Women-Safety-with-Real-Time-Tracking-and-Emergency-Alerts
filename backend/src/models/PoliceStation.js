const mongoose = require("mongoose");

const policeStationSchema = new mongoose.Schema({
  name: { type: String, required: true },
//   location: {
//     lat: Number,
//     lng: Number,
//   },
location: {       // ✅ GeoJSON format
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // for login
  autoToken: { type: String }, // store autologin token
  status: { type: String, enum: ["online", "offline", "busy"], default: "offline" },
  lastHeartbeat: { type: Date }
});


policeStationSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("PoliceStation", policeStationSchema);
