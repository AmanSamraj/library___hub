const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const Cart = require("../models/cart_model");
const { SECRET, OTP_EXPIRY_MINUTES } = require("../config/env");
const { sanitizeUser } = require("../utils/serializers.util");
const { createOtp, hashOtp, maskEmail } = require("../utils/auth.util");
const { sendLoginOtpEmail } = require("../services/mail.service");

async function register(req, res) {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const phone = String(req.body.phone || "").trim();

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters long" });
    }

    const exists = await User.findOne({
      $or: [
        { email },
        { username: new RegExp("^" + username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }
      ]
    });

    if (exists) {
      return res.status(409).json({ message: "A user with that email or username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      phone,
      passwordHash
    });

    await Cart.create({
      userId: user._id,
      items: []
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not register user", error: error.message });
  }
}

async function login(req, res) {
  try {
    const emailOrUsername = String(req.body.emailOrUsername || req.body.username || "").trim();
    const password = String(req.body.password || "");

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: new RegExp("^" + emailOrUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const otp = createOtp();
    user.loginOtpHash = hashOtp(otp);
    user.loginOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    await sendLoginOtpEmail(user, otp);

    return res.json({
      message: "OTP sent to your email. Verify it to complete login.",
      requiresOtp: true,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      expiresInMinutes: OTP_EXPIRY_MINUTES
    });
  } catch (error) {
    const status = error.message && error.message.includes("SMTP email settings are missing") ? 503 : 500;
    return res.status(status).json({ message: "Could not start OTP login", error: error.message });
  }
}

async function verifyOtp(req, res) {
  try {
    const emailOrUsername = String(req.body.emailOrUsername || req.body.username || "").trim();
    const otp = String(req.body.otp || "").trim();

    if (!emailOrUsername || !otp) {
      return res.status(400).json({ message: "Email or username and OTP are required" });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: new RegExp("^" + emailOrUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.loginOtpHash || !user.loginOtpExpiresAt) {
      return res.status(400).json({ message: "Please request a fresh OTP before verifying" });
    }

    if (user.loginOtpExpiresAt.getTime() < Date.now()) {
      user.loginOtpHash = "";
      user.loginOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    if (hashOtp(otp) !== user.loginOtpHash) {
      return res.status(401).json({ message: "Incorrect OTP" });
    }

    user.loginOtpHash = "";
    user.loginOtpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: String(user._id) }, SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not verify OTP login", error: error.message });
  }
}

function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = {
  register,
  login,
  verifyOtp,
  me
};
