// lib/email-nodemailer.ts
import nodemailer from 'nodemailer';

const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.error('Email configuration missing: set EMAIL_USER and EMAIL_PASSWORD (Gmail App Password) in .env');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export default async function sendFollowUpEmail(
  to: string,
  name: string,
  subject: string,
  message: string
) {
  const mailOptions = {
    from: `"Sales Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <h2>Hi ${name},</h2>
      <p>${message}</p>
      <p>Best regards,<br>Sales Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error: any) {
    // Provide clearer guidance on common Gmail auth failures
    if (error?.code === 'EAUTH' || error?.responseCode === 535) {
      console.error('Nodemailer authentication failed. Ensure Gmail 2FA is enabled and use an App Password, not your regular password.');
    }
    console.error('Nodemailer error:', error);
    throw error;
  }
}