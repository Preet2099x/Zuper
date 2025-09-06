// quick test route - add to a router you mount
import express from "express";
import sendEmail from "../config/mailer.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  const to = req.query.to || "your-email@example.com";
  const r = await sendEmail({
    to,
    subject: "Zuper test email",
    text: `This is a test email from Zuper at ${new Date().toISOString()}`
  });
  if (r.ok) return res.json({ message: "Email sent (or logged)", result: r });
  return res.status(500).json({ message: "Email failed", error: r.error });
});

export default router;
