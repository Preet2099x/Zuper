import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true 
  },
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Provider", 
    required: true 
  },
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vehicle", 
    required: true 
  },

  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },

  status: { 
    type: String, 
    enum: ["active", "completed", "cancelled"], 
    default: "active" 
  }
}, { timestamps: true });

export default mongoose.model("Contract", contractSchema);
