const crypto = require("crypto");

function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function maskEmail(email) {
  const parts = String(email || "").split("@");
  if (parts.length !== 2) {
    return email;
  }

  const localPart = parts[0];
  const domain = parts[1];
  const visibleStart = localPart.slice(0, 2);
  return visibleStart + "*".repeat(Math.max(1, localPart.length - visibleStart.length)) + "@" + domain;
}

module.exports = {
  createOtp,
  hashOtp,
  maskEmail
};
