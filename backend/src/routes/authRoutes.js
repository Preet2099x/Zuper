import express from "express";
import {
  signupCustomer, loginCustomer, verifyEmail,
  sendPhoneOtp, verifyPhone
} from "../controllers/authController.js";

const router = express.Router();

// Customer auth
router.post("/customer/signup", signupCustomer);
router.post("/customer/login", loginCustomer);
router.get("/customer/verify-email/:token", verifyEmail);
router.post("/customer/send-otp", sendPhoneOtp);
router.post("/customer/verify-phone", verifyPhone);

// TODO: provider/admin routes analogous
export default router;
