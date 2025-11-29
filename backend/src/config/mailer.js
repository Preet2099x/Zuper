// src/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM = process.env.EMAIL_FROM || "zuper@app.local";

let transporter = null;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    pool: true, // Enable connection pooling
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 30000,
  });

  // verify connection (non-blocking)
  transporter.verify()
    .then(() => console.log("Mailer: SMTP ready with connection pool"))
    .catch(err => {
      console.warn("Mailer verify failed — falling back to console. Error:", err.message);
      transporter = null;
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
