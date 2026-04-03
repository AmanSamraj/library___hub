const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const Cart = require("../models/cart_model");
const { SECRET, OTP_EXPIRY_MINUTES } = require("../config/env");
const { isDatabaseReady } = require("../config/database");
const { sanitizeUser } = require("../utils/serializers.util");
const { createOtp, hashOtp, maskEmail } = require("../utils/auth.util");
const { findUserByIdentity, createOrUpdatePendingUser, verifyPendingUser } = require("../services/local-auth.service");
const { sendRegisterOtpEmail } = require("../services/mail.service");

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

    const useDatabase = isDatabaseReady();
    let existingUser = null;

    if (useDatabase) {
      existingUser = await User.findOne({
        $or: [
          { email },
          { username: new RegExp("^" + username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }
        ]
      });
    } else {
      existingUser = await findUserByIdentity(email) || await findUserByIdentity(username);
    }

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: "A user with that email or username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = createOtp();
    let user = existingUser;

    if (useDatabase) {
      if (!user) {
        user = new User({
          username,
          email,
          phone,
          passwordHash
        });
      } else {
        user.username = username;
        user.email = email;
        user.phone = phone;
        user.passwordHash = passwordHash;
      }

      user.isVerified = false;
      user.registerOtpHash = hashOtp(otp);
      user.registerOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await user.save();
    } else {
      user = await createOrUpdatePendingUser({
        username,
        email,
        phone,
        passwordHash,
        registerOtpHash: hashOtp(otp),
        registerOtpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()
      });
    }

    const deliveryResult = await sendRegisterOtpEmail(user, otp);

    return res.status(existingUser ? 200 : 201).json({
      message: "OTP sent to your email. Verify it to complete registration.",
      requiresOtp: true,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      delivery: deliveryResult.delivery
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not start registration", error: error.message });
  }
}

async function login(req, res) {
  try {
    const emailOrUsername = String(req.body.emailOrUsername || req.body.username || "").trim();
    const password = String(req.body.password || "");
    const useDatabase = isDatabaseReady();
    let user = null;

    if (useDatabase) {
      user = await User.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: new RegExp("^" + emailOrUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }
        ]
      });
    } else {
      user = await findUserByIdentity(emailOrUsername);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account with OTP before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: String(user._id) }, SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not log in", error: error.message });
  }
}

async function verifyRegisterOtp(req, res) {
  try {
    const emailOrUsername = String(req.body.emailOrUsername || req.body.username || "").trim();
    const otp = String(req.body.otp || "").trim();
    const useDatabase = isDatabaseReady();

    if (!emailOrUsername || !otp) {
      return res.status(400).json({ message: "Email or username and OTP are required" });
    }

    let user = null;

    if (useDatabase) {
      user = await User.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: new RegExp("^" + emailOrUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }
        ]
      });
    } else {
      user = await findUserByIdentity(emailOrUsername);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.registerOtpHash || !user.registerOtpExpiresAt) {
      return res.status(400).json({ message: "Please request a fresh OTP before verifying" });
    }

    const otpExpiresAt = new Date(user.registerOtpExpiresAt);

    if (otpExpiresAt.getTime() < Date.now()) {
      user.registerOtpHash = "";
      user.registerOtpExpiresAt = null;

      if (useDatabase) {
        await user.save();
      } else {
        await createOrUpdatePendingUser({
          username: user.username,
          email: user.email,
          phone: user.phone,
          passwordHash: user.passwordHash,
          registerOtpHash: "",
          registerOtpExpiresAt: null
        });
      }

      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    if (hashOtp(otp) !== user.registerOtpHash) {
      return res.status(401).json({ message: "Incorrect OTP" });
    }

    if (useDatabase) {
      user.registerOtpHash = "";
      user.registerOtpExpiresAt = null;
      user.isVerified = true;
      await user.save();

      const existingCart = await Cart.findOne({ userId: user._id });

      if (!existingCart) {
        await Cart.create({
          userId: user._id,
          items: []
        });
      }
    } else {
      user = await verifyPendingUser(emailOrUsername);
    }

    return res.json({
      message: "Registration successful. You can log in now.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not verify registration OTP", error: error.message });
  }
}

function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = {
  register,
  login,
  verifyRegisterOtp,
  me
};
