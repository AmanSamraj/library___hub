const nodemailer = require("nodemailer");
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  OTP_EXPIRY_MINUTES
} = require("../config/env");

function getMailTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("SMTP email settings are missing. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

async function sendLoginOtpEmail(user, otp) {
  const transporter = getMailTransporter();

  await transporter.sendMail({
    from: SMTP_FROM,
    to: user.email,
    subject: "Your Library Hub login OTP",
    text: [
      "Hello " + user.username + ",",
      "",
      "Your Library Hub login OTP is: " + otp,
      "",
      "This code will expire in " + OTP_EXPIRY_MINUTES + " minutes.",
      "If you did not try to log in, please ignore this email."
    ].join("\n")
  });
}

module.exports = {
  sendLoginOtpEmail
};
