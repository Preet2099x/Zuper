// src/models/DocumentVerification.js
import mongoose from "mongoose";

const documentVerificationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  documentType: {
    type: String,
    enum: ["license", "aadhar"],
    required: true
  },

  // Document numbers
  aadharNumber: {
    type: String,
    required: function() { return this.documentType === "aadhar"; }
  },

  licenseNumber: {
    type: String,
    required: function() { return this.documentType === "license"; }
  },

  documentImage: {
    type: String, // Azure blob URL
    required: true
  },

  status: {
    type: String,
    enum: ["processing", "verified", "rejected"],
    default: "processing"
  },

  adminNotes: {
    type: String,
    default: ""
  },

  verifiedAt: {
    type: Date
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
}, { timestamps: true });

// Compound index to ensure one document per type per customer
documentVerificationSchema.index({ customer: 1, documentType: 1 }, { unique: true });

export default mongoose.model("DocumentVerification", documentVerificationSchema);