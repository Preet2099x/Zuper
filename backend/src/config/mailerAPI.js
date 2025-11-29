// Brevo API mailer (works on Render.com free tier)
// Using direct REST API calls instead of SDK for better ES module compatibility
import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.SMTP_PASS;
const FROM_EMAIL = process.env.EMAIL_FROM || 'zuper.official.2529@gmail.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Zuper';

if (BREVO_API_KEY) {
  console.log('✓ Mailer: Brevo API ready (using HTTP API - works on Render free tier)');
} else {
  console.warn('⚠ Brevo API key not set - emails will log to console');
}

async function sendEmailInternal({ to, subject, text, html }, retries = 3) {
  if (!BREVO_API_KEY) {
    console.log('=== EMAIL (dev fallback) ===');
    console.log('to:', to);
    console.log('subject:', subject);
    console.log('===========================');
    return { ok: true, dev: true };
  }

  const emailData = {
    sender: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html || `<p>${text}</p>`,
    textContent: text
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log(`✓ Email sent (attempt ${attempt}):`, result.messageId || 'success');
      return { ok: true, messageId: result.messageId };
    } catch (err) {
      console.error(`✗ sendMail failed (attempt ${attempt}/${retries}):`, err.message);
      
      if (attempt === retries) {
        console.log('=== EMAIL (fallback after retries) ===', { to, subject });
        return { ok: false, error: err.message };
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Non-blocking version
export default function sendEmail({ to, subject, text, html }) {
  sendEmailInternal({ to, subject, text, html }).catch(err => {
    console.error('Background email error:', err.message);
  });
  
  return Promise.resolve({ ok: true, queued: true });
}

// Blocking version
export async function sendEmailBlocking({ to, subject, text, html }) {
  return sendEmailInternal({ to, subject, text, html });
}
