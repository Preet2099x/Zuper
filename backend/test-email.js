// Test script to verify email configuration
// Run with: node backend/test-email.js

import dotenv from 'dotenv';
import sendEmail from './src/config/mailer.js';

dotenv.config();

console.log('Testing email configuration...\n');

console.log('SMTP Settings:');
console.log('- Host:', process.env.SMTP_HOST);
console.log('- Port:', process.env.SMTP_PORT);
console.log('- User:', process.env.SMTP_USER);
console.log('- Pass:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
console.log('');

// Test sending an email
const testEmail = process.env.SMTP_USER || 'test@example.com';

console.log(`Sending test email to: ${testEmail}`);

sendEmail({
  to: testEmail,
  subject: 'Zuper - Email Configuration Test',
  text: 'This is a test email from Zuper backend. If you receive this, your email configuration is working correctly!',
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #2563eb;">✅ Email Configuration Test</h2>
      <p>Congratulations! Your Zuper email configuration is working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated test email from Zuper.</p>
    </div>
  `
});

console.log('✅ Email queued successfully (non-blocking)');
console.log('Check your inbox in a few seconds...\n');

// Wait a bit to see SMTP logs
setTimeout(() => {
  console.log('Test complete. Check the logs above for any errors.');
  process.exit(0);
}, 5000);
