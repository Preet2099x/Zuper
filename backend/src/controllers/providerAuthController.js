import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Provider from "../models/Provider.js"; 
import sendEmail from "../config/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ----- HELPERS -----
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); 
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// ----- SIGNUP -----
export const signupProvider = async (req, res) => { 
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Validate Indian phone number format: +91 followed by 10 digits
    const phoneRegex = /^\+91\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone must be in format +91XXXXXXXXXX (10 digits)" });
    }

    const existing = await Provider.findOne({ $or: [{ email }, { phone }] }); 
    
    // If account exists but is not verified, allow re-signup with new OTP
    if (existing && !existing.isEmailVerified) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOtp();
      const hashedOtp = hashOtp(otp);

      // Update existing unverified account with new details
      existing.name = name;
      existing.email = email;
      existing.phone = phone;
      existing.password = hashedPassword;
      existing.emailVerificationCode = hashedOtp;
      existing.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
      await existing.save();

      await sendEmail({
        to: email,
        subject: "Verify your Zuper account",
        text: `
        Hello ${name},

        Welcome back to Zuper! We noticed you started signup but didn't verify your email.

        Your new verification code is: ${otp}

        This code will expire in 15 minutes. If you did not sign up for a Zuper account, please ignore this email.

        Thanks,
        The Zuper Team
        `,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="color: #2563eb;">Welcome back to Zuper!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We noticed you started signup but didn't verify your email. Here's a new verification code:</p>
          <p style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #111;">
              ${otp}
          </p>
          <p>This code will expire in <strong>15 minutes</strong>.</p>
          <p>If you didn't create a Zuper account, you can ignore this message.</p>
          <p style="margin-top: 20px;">— The Zuper Team</p>
          </div>
        `,
      });

      return res.status(200).json({
        message: "Account exists but was not verified. New verification code sent to email.",
      });
    }

    // If account exists and is verified, reject signup
    if (existing) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    // Create new account
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    const provider = await Provider.create({ 
      name,
      email,
      phone,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationCode: hashedOtp,
      emailVerificationExpires: Date.now() + 15 * 60 * 1000, 
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
      `,
    });

    return res.status(201).json({
      message: "Signup successful. Verification code sent to email.",
    });
  } catch (err) {
    console.error("provider signup error:", err); // Updated log
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- VERIFY EMAIL -----
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email and code required" });

    const provider = await Provider.findOne({ email }); // Changed variable and model
    if (!provider) return res.status(404).json({ message: "Provider not found" }); // Updated message
    if (provider.isEmailVerified) return res.json({ message: "Email already verified" });

    if (!provider.emailVerificationCode || Date.now() > provider.emailVerificationExpires) {
      return res.status(400).json({ message: "Code expired. Request a new one." });
    }

    if (hashOtp(code) !== provider.emailVerificationCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    provider.isEmailVerified = true;
    provider.emailVerificationCode = undefined;
    provider.emailVerificationExpires = undefined;
    await provider.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmailOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- RESEND EMAIL OTP -----
export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const provider = await Provider.findOne({ email }); // Changed variable and model
    if (!provider) return res.status(404).json({ message: "Provider not found" }); // Updated message
    if (provider.isEmailVerified) return res.json({ message: "Email already verified" });

    const otp = generateOtp();
    provider.emailVerificationCode = hashOtp(otp);
    provider.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
    await provider.save();

    await sendEmail({
      to: email,
      subject: "Zuper Email Verification (Resend)",
      text: `Your new verification code is ${otp}. It expires in 15 minutes.`,
    });

    return res.json({ message: "New verification code sent" });
  } catch (err) {
    console.error("resendEmailOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- LOGIN -----
export const loginProvider = async (req, res) => { 
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ message: "Missing fields" });

    const provider = await Provider.findOne({ 
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    if (!provider) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, provider.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (!provider.isEmailVerified) return res.status(403).json({ message: "Verify your email first" });

    const token = signToken({ id: provider._id, role: "provider" }); 

    return res.json({
      token,
      provider: { id: provider._id, name: provider.name, email: provider.email, phone: provider.phone }, 
    });
  } catch (err) {
    console.error("provider login error:", err); 
    return res.status(500).json({ message: "Server error" });
  }
};