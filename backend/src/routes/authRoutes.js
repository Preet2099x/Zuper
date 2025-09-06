import express from "express";
import {
  signupCustomer,
  verifyEmailOtp,
  resendEmailOtp,
  loginCustomer
} from "../controllers/authController.js";

const router = express.Router();

router.post("/customer/signup", signupCustomer);
router.post("/customer/verify-email", verifyEmailOtp);
router.post("/customer/resend-email-otp", resendEmailOtp);
router.post("/customer/login", loginCustomer);

export default router;
