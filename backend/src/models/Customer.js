// src/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true, lowercase: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String }, // store hashed OTP
  emailVerificationExpires: { type: Date },

  phone: { type: String, required: true, unique: true },
  isPhoneVerified: { type: Boolean, default: false },
  phoneVerificationCode: { type: String },
  phoneVerificationExpires: { type: Date },

  password: { type: String, required: true },

  contracts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contract" }]
}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
