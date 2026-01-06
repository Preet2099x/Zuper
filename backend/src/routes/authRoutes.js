import express from "express";
import {
  signupCustomer,
  verifyEmailOtp as verifyCustomerEmailOtp, 
  resendEmailOtp as resendCustomerEmailOtp, 
  loginCustomer,
  googleAuthCustomer,
  forgotPasswordCustomer,
  resetPasswordCustomer,
} from "../controllers/customerAuthController.js";
import {
  signupProvider,
  verifyEmailOtp as verifyProviderEmailOtp, 
  resendEmailOtp as resendProviderEmailOtp, 
  loginProvider,
  googleAuthProvider,
  forgotPasswordProvider,
  resetPasswordProvider,
} from "../controllers/providerAuthController.js";
import { loginAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

/**
 * @swagger
 * /auth/customer/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new customer
 *     description: Create a new customer account with email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 pattern: '^\\+91\\d{10}$'
 *                 example: '+919876543210'
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: Customer created successfully, OTP sent to email
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/customer/signup", signupCustomer);

/**
 * @swagger
 * /auth/customer/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Customer login
 *     description: Login with email/phone and password to receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - password
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Invalid credentials or email not verified
 */
router.post("/customer/login", loginCustomer);

router.post("/customer/verify-email", verifyCustomerEmailOtp);
router.post("/customer/resend-email-otp", resendCustomerEmailOtp);
router.post("/customer/google-auth", googleAuthCustomer);
router.post("/customer/forgot-password", forgotPasswordCustomer);
router.post("/customer/reset-password", resetPasswordCustomer);

// --- Provider Routes ---
/**
 * @swagger
 * /auth/provider/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new provider
 *     description: Create a new provider account for vehicle owners
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - businessName
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               businessName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Provider created successfully
 */
router.post("/provider/signup", signupProvider);

/**
 * @swagger
 * /auth/provider/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Provider login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/provider/login", loginProvider);

router.post("/provider/verify-email", verifyProviderEmailOtp);
router.post("/provider/resend-email-otp", resendProviderEmailOtp);
router.post("/provider/google-auth", googleAuthProvider);
router.post("/provider/forgot-password", forgotPasswordProvider);
router.post("/provider/reset-password", resetPasswordProvider);

// --- Admin Routes ---
/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 */
router.post("/admin/login", loginAdmin);

export default router;