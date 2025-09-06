import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  businessName: { type: String },

  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }]
}, { timestamps: true });

export default mongoose.model("Provider", providerSchema);
