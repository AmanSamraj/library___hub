const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, required: true },
    line1: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    label: { type: String, trim: true, default: "HOME" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    registerOtpHash: {
      type: String,
      default: ""
    },
    registerOtpExpiresAt: {
      type: Date,
      default: null
    },
    loginOtpHash: {
      type: String,
      default: ""
    },
    loginOtpExpiresAt: {
      type: Date,
      default: null
    },
    defaultAddress: {
      type: addressSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
