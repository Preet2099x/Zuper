// src/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM = process.env.EMAIL_FROM || "zuper@app.local";

// console.log("SMTP ENV CHECK", {
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   user: process.env.SMTP_USER,
//   passLen: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0
// });


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
  });

  // verify connection (non-blocking)
  transporter.verify()
    .then(() => console.log("Mailer: SMTP ready"))
    .catch(err => {
      console.warn("Mailer verify failed — falling back to console. Error:", err.message);
      transporter = null;
    });
} else {
  console.log("Mailer: SMTP not configured — using console fallback");
}

export default async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    console.log("=== EMAIL (dev fallback) ===");
    console.log("from:", FROM);
    console.log("to:", to);
    console.log("subject:", subject);
    console.log("text:", text);
    if (html) console.log("html:", html);
    console.log("===========================");
    return { ok: true, dev: true };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", info.messageId || info);
    return { ok: true, info };
  } catch (err) {
    console.error("sendMail failed — falling back to console. Error:", err.message);
    console.log("=== EMAIL (fallback) ===", { from: FROM, to, subject, text, html });
    return { ok: false, error: err.message };
  }
}
