const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
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

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
