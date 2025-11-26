import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentByContract,
  getCustomerPayments,
  handleWebhook
} from "../controllers/paymentController.js";
import { protectCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer payment routes
router.post("/create-order/:contractId", protectCustomer, createPaymentOrder);
router.post("/verify", protectCustomer, verifyPayment);
router.get("/contract/:contractId", protectCustomer, getPaymentByContract);
router.get("/customer/history", protectCustomer, getCustomerPayments);

// Webhook route (no authentication - Razorpay will sign it)
router.post("/webhook", express.json({ type: 'application/json' }), handleWebhook);

export default router;
