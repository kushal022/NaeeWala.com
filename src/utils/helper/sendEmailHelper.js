import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to, subject, text) {
  // send via email (nodemailer) or SMS (Twilio) — example email:
  const sendMail = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
  });
  return sendMail;
}
