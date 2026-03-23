require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SECRET: process.env.JWT_SECRET || "library-hub-secret",
  MONGODB_URI: process.env.MONGODB_URI,
  OTP_EXPIRY_MINUTES: Math.max(1, Number(process.env.LOGIN_OTP_EXPIRY_MINUTES || 10)),
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_SECURE: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || ""
};
