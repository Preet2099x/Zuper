import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true, lowercase: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String }, // store hashed OTP
  emailVerificationExpires: { type: Date },

  phone: { type: String, unique: true, sparse: true },
  isPhoneVerified: { type: Boolean, default: false },
  phoneVerificationCode: { type: String },
  phoneVerificationExpires: { type: Date },

  password: { type: String },
  
  // Password reset fields
  passwordResetCode: { type: String },
  passwordResetExpires: { type: Date },
  
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },

  businessName: { type: String },

  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],

  // Business profile fields
  contactEmail: { type: String },
  businessAddress: { type: String },
  businessDescription: { type: String },
  website: { type: String },
  businessLogo: { type: String }, // URL to logo image stored in Azure

  // Business info fields
  taxId: { type: String },
  insuranceProvider: { type: String },
  policyNumber: { type: String },
  licenseNumber: { type: String },
  operatingHours: { type: String },

  // Payment fields
  bankName: { type: String },
  accountNumber: { type: String },
  routingNumber: { type: String },
  paypalEmail: { type: String },
  autoPayout: { type: Boolean, default: true },
  payoutSchedule: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: 'monthly' }
}, { timestamps: true });

export default mongoose.model("Provider", providerSchema);
