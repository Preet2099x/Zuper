import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "BookingRequest", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  paymentPlan: { type: String, enum: ["full", "emi"], default: "full" },
  emi: {
    totalInstallments: { type: Number },
    installmentAmount: { type: Number },
    installmentsPaid: { type: Number, default: 0 },
    remainingAmount: { type: Number },
    installments: [
      {
        orderId: { type: String },
        paymentId: { type: String },
        signature: { type: String },
        amount: { type: Number },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
        paidAt: { type: Date }
      }
    ]
  },
  
  // Payment status: pending -> paid/failed
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  method: { type: String, default: "Razorpay" },

  // Razorpay specific fields
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },

  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
