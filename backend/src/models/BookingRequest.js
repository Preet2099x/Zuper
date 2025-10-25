import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema({
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

  // Booking status: pending (waiting), approved, rejected, cancelled
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "cancelled"], 
    default: "pending" 
  },

  // Total cost calculation
  numberOfDays: {
    type: Number,
    required: true
  },
  dailyRate: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },

  // Messages/Notes
  customerNote: {
    type: String,
    trim: true
  },
  providerNote: {
    type: String,
    trim: true
  },

  // Related contract (created when approved)
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
    default: null
  }
}, { timestamps: true });

// Index for faster queries
bookingRequestSchema.index({ customer: 1, status: 1 });
bookingRequestSchema.index({ provider: 1, status: 1 });
bookingRequestSchema.index({ vehicle: 1, status: 1 });

export default mongoose.model("BookingRequest", bookingRequestSchema);
