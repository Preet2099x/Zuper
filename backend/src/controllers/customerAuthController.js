import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Customer from "../models/Customer.js";
import sendEmail from "../config/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ----- HELPERS -----
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// ----- SIGNUP -----
export const signupCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: "Email or phone already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    const customer = await Customer.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationCode: hashedOtp,
      emailVerificationExpires: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    await sendEmail({
    to: email,
    subject: "Verify your Zuper account",
    text: `
    Hello ${name},

    Welcome to Zuper! To finish setting up your account, please verify your email.

    Your verification code is: ${otp}

    This code will expire in 15 minutes. If you did not sign up for a Zuper account, please ignore this email.

    Thanks,
    The Zuper Team
    `,
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="color: #2563eb;">Welcome to Zuper!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>To complete your signup, please verify your email using the code below:</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #111;">
            ${otp}
        </p>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn’t create a Zuper account, you can ignore this message.</p>
        <p style="margin-top: 20px;">— The Zuper Team</p>
        </div>
    `
    });


    return res.status(201).json({
      message: "Signup successful. Verification code sent to email."
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- verify email -----
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email and code required" });

    const user = await Customer.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.json({ message: "Email already verified" });

    if (!user.emailVerificationCode || Date.now() > user.emailVerificationExpires) {
      return res.status(400).json({ message: "Code expired. Request a new one." });
    }

    if (hashOtp(code) !== user.emailVerificationCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmailOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- resend email OTP -----
export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await Customer.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.json({ message: "Email already verified" });

    const otp = generateOtp();
    user.emailVerificationCode = hashOtp(otp);
    user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Zuper Email Verification (Resend)",
      text: `Your new verification code is ${otp}. It expires in 15 minutes.`
    });

    return res.json({ message: "New verification code sent" });
  } catch (err) {
    console.error("resendEmailOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- login -----
export const loginCustomer = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await Customer.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isEmailVerified) return res.status(403).json({ message: "Verify your email first" });

    const token = signToken({ id: user._id, role: "customer" });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
