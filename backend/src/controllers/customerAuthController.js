import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import Customer from "../models/Customer.js";
import sendEmail from "../config/mailerAPI.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

    // Validate Indian phone number format: +91 followed by 10 digits
    const phoneRegex = /^\+91\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone must be in format +91XXXXXXXXXX (10 digits)" });
    }

    const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
    
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
        `
      });

      return res.status(200).json({
        message: "Account exists but was not verified. New verification code sent to email."
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
    if (!emailOrPhone || !password) return res.status(400).json({ message: "Email/phone and password are required" });

    const user = await Customer.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    // Check if account uses Google OAuth (no password)
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google login. Please sign in with Google." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Incorrect password. Please try again." });

    if (!user.isEmailVerified) return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox for the verification code." });

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

// ----- FORGOT PASSWORD -----
export const forgotPasswordCustomer = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await Customer.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    // Check if account was created with Google OAuth (no password)
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google login. Please sign in with Google." });
    }

    const otp = generateOtp();
    user.passwordResetCode = hashOtp(otp);
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await sendEmail({
      to: email,
      subject: "Reset your Zuper password",
      text: `
      Hello ${user.name},

      We received a request to reset your password for your Zuper account.

      Your password reset code is: ${otp}

      This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.

      Thanks,
      The Zuper Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>We received a request to reset your password. Use the code below to reset it:</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #111;">
            ${otp}
        </p>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="margin-top: 20px;">— The Zuper Team</p>
        </div>
      `
    });

    return res.json({ message: "Password reset code sent to email" });
  } catch (err) {
    console.error("forgotPasswordCustomer error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- RESET PASSWORD -----
export const resetPasswordCustomer = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password required" });
    }

    const user = await Customer.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.passwordResetCode || Date.now() > user.passwordResetExpires) {
      return res.status(400).json({ message: "Code expired or invalid. Request a new one." });
    }

    if (hashOtp(code) !== user.passwordResetCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetPasswordCustomer error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----- GOOGLE OAUTH LOGIN -----
export const googleAuthCustomer = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Google" });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({ email });

    if (customer) {
      // Update Google ID if not set
      if (!customer.googleId) {
        customer.googleId = googleId;
        customer.profilePicture = picture;
        await customer.save();
      }
    } else {
      // Create new customer account
      customer = await Customer.create({
        name: name || "Google User",
        email,
        googleId,
        profilePicture: picture,
        isEmailVerified: true, // Google accounts are pre-verified
        phone: null, // Optional: User can add phone later
        password: null, // No password for Google OAuth users
      });
    }

    // Generate JWT token
    const token = signToken({ id: customer._id, role: "customer" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        profilePicture: customer.profilePicture,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};
