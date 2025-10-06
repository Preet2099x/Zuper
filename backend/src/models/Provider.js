import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
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

  businessName: { type: String },

  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }]
}, { timestamps: true });

export default mongoose.model("Provider", providerSchema);
