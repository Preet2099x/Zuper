import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  // Basic Information
  company: { 
    type: String, 
    required: true,
    trim: true
  },
  model: { 
    type: String, 
    required: true,
    trim: true
  },
  year: { 
    type: Number, 
    required: true,
    min: 2000,
    max: 2030
  },
  licensePlate: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },

  // Pricing (in Rupees)
  dailyRate: { 
    type: Number, 
    required: true,
    min: 1
  },

  // Location (custom text input)
  location: { 
    type: String, 
    required: true,
    trim: true
  },

  // Features
  features: [{ 
    type: String,
    trim: true
  }],

  // Description
  description: { 
    type: String,
    trim: true
  },

  // Images
  images: [{ 
    type: String,
    trim: true
  }],

  // Provider Reference
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Provider", 
    required: true 
  },

  // Vehicle Type (optional, can be inferred or added later)
  type: { 
    type: String, 
    enum: ["car", "bike", "scooter"],
    default: "car"
  },

  // Kilometer Limit (optional, for rental terms)
  kmLimit: { 
    type: Number, 
    default: 1000 
  },

  // Status
  status: { 
    type: String, 
    enum: ["available", "rented", "maintenance"], 
    default: "available" 
  },

  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster searches
vehicleSchema.index({ company: 1, model: 1 });
vehicleSchema.index({ location: 1 });
vehicleSchema.index({ dailyRate: 1 });
vehicleSchema.index({ status: 1 });

export default mongoose.model("Vehicle", vehicleSchema);
