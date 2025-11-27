import express from "express";
import {
  signupCustomer,
  verifyEmailOtp as verifyCustomerEmailOtp, // Use alias to avoid name conflict
  resendEmailOtp as resendCustomerEmailOtp, // Use alias to avoid name conflict
  loginCustomer,
  googleAuthCustomer,
  forgotPasswordCustomer,
  resetPasswordCustomer,
} from "../controllers/customerAuthController.js";
import {
  signupProvider,
  verifyEmailOtp as verifyProviderEmailOtp, // Use alias to avoid name conflict
  resendEmailOtp as resendProviderEmailOtp, // Use alias to avoid name conflict
  loginProvider,
  googleAuthProvider,
  forgotPasswordProvider,
  resetPasswordProvider,
} from "../controllers/providerAuthController.js";
import { loginAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

// --- Customer Routes ---
router.post("/customer/signup", signupCustomer);
router.post("/customer/verify-email", verifyCustomerEmailOtp);
router.post("/customer/resend-email-otp", resendCustomerEmailOtp);
router.post("/customer/login", loginCustomer);
router.post("/customer/google-auth", googleAuthCustomer);
router.post("/customer/forgot-password", forgotPasswordCustomer);
router.post("/customer/reset-password", resetPasswordCustomer);

// --- Provider Routes ---
router.post("/provider/signup", signupProvider);
router.post("/provider/verify-email", verifyProviderEmailOtp);
router.post("/provider/resend-email-otp", resendProviderEmailOtp);
router.post("/provider/login", loginProvider);
router.post("/provider/google-auth", googleAuthProvider);
router.post("/provider/forgot-password", forgotPasswordProvider);
router.post("/provider/reset-password", resetPasswordProvider);

// --- Admin Routes ---
router.post("/admin/login", loginAdmin);

export default router;