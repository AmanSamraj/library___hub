const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    badge: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    inventory: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
