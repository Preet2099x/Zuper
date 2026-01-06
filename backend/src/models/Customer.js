// src/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true, lowercase: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Date },

  phone: { type: String, unique: true, sparse: true },
  isPhoneVerified: { type: Boolean, default: false },
  phoneVerificationCode: { type: String },
  phoneVerificationExpires: { type: Date },

  dob: { type: Date, required: false },

  password: { type: String },
  
  // Password reset fields
  passwordResetCode: { type: String },
  passwordResetExpires: { type: Date },
  
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },

  contracts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contract" }]
}, { timestamps: true });

// Performance indexes for faster queries
// Note: email and phone already have unique indexes from schema definition
customerSchema.index({ isEmailVerified: 1 }); // For filtering verified users
customerSchema.index({ createdAt: -1 }); // For sorting by registration date

export default mongoose.model("Customer", customerSchema);
