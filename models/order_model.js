const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "" },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    label: { type: String, default: "HOME", trim: true }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, required: true, default: "upi" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [orderItemSchema],
      default: []
    },
    shippingAddress: {
      type: addressSchema,
      required: true
    },
    payment: {
      type: paymentSchema,
      required: true
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      fee: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 }
    },
    status: {
      type: String,
      default: "placed",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
