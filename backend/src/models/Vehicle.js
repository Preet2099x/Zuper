import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["car", "bike", "scooter"], 
    required: true 
  },
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Provider", 
    required: true 
  },

  price: { 
    type: Number, 
    required: true 
  },
  kmLimit: { 
    type: Number, 
    default: 1000 
  },

  status: { 
    type: String, 
    enum: ["available", "rented"], 
    default: "available" 
  }
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);
