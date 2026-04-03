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
    return null;
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

async function sendOtpEmail(user, otp, subject, introLine) {
  const transporter = getMailTransporter();

  if (!transporter) {
    console.log("[DEV OTP] " + subject + " for " + user.email + ": " + otp);
    return {
      delivery: "console"
    };
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to: user.email,
    subject: subject,
    text: [
      "Hello " + user.username + ",",
      "",
      introLine + ": " + otp,
      "",
      "This code will expire in " + OTP_EXPIRY_MINUTES + " minutes.",
      "If you did not try to log in, please ignore this email."
    ].join("\n")
  });

  return {
    delivery: "email"
  };
}

async function sendLoginOtpEmail(user, otp) {
  return sendOtpEmail(user, otp, "Your Library Hub login OTP", "Your Library Hub login OTP is");
}

async function sendRegisterOtpEmail(user, otp) {
  return sendOtpEmail(user, otp, "Your Library Hub registration OTP", "Your Library Hub registration OTP is");
}

module.exports = {
  sendLoginOtpEmail,
  sendRegisterOtpEmail
};
