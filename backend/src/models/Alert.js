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
        enum: ["Point"], 
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

   
    userSnapshot: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },

    contactsSnapshot: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],

    time: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    nearestPoliceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
    },


    
    
    evidence: {
      photos: [String], 
      voiceNotes: [String], 
      message: { type: String, required:true }, 
    },
    acknowledged: { type: Boolean, default: false },
  },
  { timestamps: true }
);


alertSchema.index({ location: "2dsphere" });


















let Alert=mongoose.model('Alert',alertSchema)
module.exports=Alert
