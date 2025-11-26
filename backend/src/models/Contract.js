import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookingRequest",
    required: true
  },
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

  // Contract status flow: PENDING_CUSTOMER -> SIGNED or VOID
  status: { 
    type: String, 
    enum: ["PENDING_CUSTOMER", "SIGNED", "VOID"], 
    default: "PENDING_CUSTOMER" 
  },

  // Signing timestamps
  providerSignedAt: {
    type: Date,
    required: true // Auto-signed when provider accepts
  },
  customerSignedAt: {
    type: Date,
    default: null
  },

  // Terms and conditions
  terms: {
    type: String,
    default: "Standard vehicle rental agreement. Customer agrees to return the vehicle in the same condition as received."
  }
}, { timestamps: true });

export default mongoose.model("Contract", contractSchema);
