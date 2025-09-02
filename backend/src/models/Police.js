const mongoose=require("mongoose");
const policeSchema=new mongoose.Schema({
name:{
    type:String,
    trim:true,
    required:true
},
 location: {
    type: {
      type: String,
      enum: ["Point"], // GeoJSON requires "Point"
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
contact:{
    type:String,
   validate: {
      validator: function (v) {
        return /^\d+$/.test(v); // must be  digits
      },
      message: props => `${props.value} is not a valid  phone number!`
    },
    required:true
}



},{timestamps:true})
policeSchema.index({ location: "2dsphere" });
let police=mongoose.model('Police',policeSchema)
module.exports=police
