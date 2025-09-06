import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";
import Admin from "../models/Admin.js"
import sendEmail from "../config/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// ====== SIGNUP (for customers as example) ======
export const signupCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ message: "Missing fields" });

    const exists = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: "Email or phone already in use" });

    const hashed = await bcrypt.hash(password, 10);

    // generate email verification token (random)
    const emailToken = crypto.randomBytes(20).toString("hex");

    const customer = await Customer.create({
      name,
      email,
      phone,
      password: hashed,
      isEmailVerified: false,
      isPhoneVerified: false,
      emailVerificationToken: emailToken
    });

    // send verification email (or return link for dev)
    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email/${emailToken}`;
    await sendEmail({
      to: email,
      subject: "Zuper: Verify your email",
      text: `Click to verify: ${verifyUrl}`
    });

    // generate phone OTP (dev: 6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    customer.phoneVerificationCode = otp;
    customer.phoneVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await customer.save();

    // For dev/testing you can send OTP in response (remove for prod)
    return res.status(201).json({ message: "Signup success. Check email and phone for verification.", otp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====== LOGIN (customer example) ======
export const loginCustomer = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await Customer.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // require email verified first (you decided email gating at signup)
    if (!user.isEmailVerified) return res.status(403).json({ message: "Please verify your email." });

    // optionally require phone verified to rent; here we still allow login even if phone unverified
    const token = signToken({ id: user._id, role: "customer" });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====== VERIFY EMAIL ======
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await Customer.findOne({ emailVerificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return res.json({ message: "Email verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== SEND/RESEND PHONE OTP (if needed) ======
export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await Customer.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneVerificationCode = otp;
    user.phoneVerificationExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // send SMS via Twilio in prod. For dev, return OTP in response or log.
    console.log("OTP for", phone, otp);
    return res.json({ message: "OTP sent", otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== VERIFY PHONE ======
export const verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const user = await Customer.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.phoneVerificationCode || user.phoneVerificationExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired or not requested" });
    }

    if (user.phoneVerificationCode !== code) return res.status(400).json({ message: "Invalid OTP" });

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    return res.json({ message: "Phone verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
