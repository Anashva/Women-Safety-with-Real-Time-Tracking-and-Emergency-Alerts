const mongoose=require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Location info
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON type "Point"
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Snapshot of user details (so police ko instantly mile without ref lookup)
    userSnapshot: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },

    // Emergency contacts at the time of alert
    contactsSnapshot: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],

    // Alert time
    time: {
      type: Date,
      default: Date.now,
    },

    // Status of alert
    status: {
      type: String,
      enum: ["pending", "active", "resolved"],
      default: "active",
    },

    // Optional: Nearest police reference (if you are mapping police stations in DB)
    nearestPoliceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Police",
    },


    
    // Extra info: culprit photo / voice message etc.
    evidence: {
      photos: [String], // store image URLs or file paths
      voiceNotes: [String], // store voice note URLs
      message: { type: String, required:true }, // optional text message
    },
  },
  { timestamps: true }
);

// For geo queries
alertSchema.index({ location: "2dsphere" });


















let Alert=mongoose.model('Alert',alertSchema)
module.exports=Alert
