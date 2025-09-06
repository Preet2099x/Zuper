// src/utils/otp.js
import crypto from "crypto";

export function generateOtp(length = 6) {
  // produce a numeric OTP of requested length
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
