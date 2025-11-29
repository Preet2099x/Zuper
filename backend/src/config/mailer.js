// src/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM = process.env.EMAIL_FROM || "zuper@app.local";

// Debug logging for production
console.log("📧 Email Configuration:");
console.log("  SMTP_HOST:", SMTP_HOST);
console.log("  SMTP_PORT:", SMTP_PORT);
console.log("  SMTP_USER:", SMTP_USER);
console.log("  SMTP_PASS:", SMTP_PASS ? "***" + SMTP_PASS.slice(-4) : "NOT SET");
console.log("  EMAIL_FROM:", FROM);

let transporter = null;
let isVerifying = false;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // Use STARTTLS for port 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 60000,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false, // Less strict for Render.com
      ciphers: 'SSLv3'
    },
    debug: true, // Enable debug logging
    logger: true // Enable logger
  });

  // verify connection (non-blocking) but don't null out transporter on failure
  isVerifying = true;
  transporter.verify()
    .then(() => {
      console.log("✓ Mailer: SMTP ready with connection pool");
      isVerifying = false;
    })
    .catch(err => {
      console.warn("⚠ Mailer verify failed but will retry on first send. Error:", err.message);
      console.warn("  This is common on platforms like Render.com - emails should still work");
      isVerifying = false;
      // Don't set transporter = null; let it try when actually sending
    });
} else {
  console.log("Mailer: SMTP not configured — using console fallback");
}

// Send email with retry logic and non-blocking execution
async function sendEmailInternal({ to, subject, text, html }, retries = 3) {
  if (!transporter) {
    console.log("=== EMAIL (dev fallback) ===");
    console.log("from:", FROM);
    console.log("to:", to);
    console.log("subject:", subject);
    console.log("===========================");
    return { ok: true, dev: true };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: FROM,
        to,
        subject,
        text,
        html,
      });
      console.log(`Email sent (attempt ${attempt}):`, info.messageId || info);
      return { ok: true, info };
    } catch (err) {
      console.error(`sendMail failed (attempt ${attempt}/${retries}):`, err.message);
      
      if (attempt === retries) {
        console.log("=== EMAIL (fallback after retries) ===", { from: FROM, to, subject });
        return { ok: false, error: err.message };
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Export a non-blocking version that fires and forgets
export default function sendEmail({ to, subject, text, html }) {
  // Fire and forget - don't await, don't block the request
  sendEmailInternal({ to, subject, text, html }).catch(err => {
    console.error("Background email error:", err.message);
  });
  
  // Return immediately
  return Promise.resolve({ ok: true, queued: true });
}

// Export blocking version for cases where we need to wait
export async function sendEmailBlocking({ to, subject, text, html }) {
  return sendEmailInternal({ to, subject, text, html });
}
