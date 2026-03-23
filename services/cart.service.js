const Cart = require("../models/cart_model");
const Product = require("../models/productmodel");

function buildCartSummary(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const fee = items.length ? items.reduce((sum, item) => sum + 9 * Number(item.quantity), 0) : 0;
  const total = subtotal + fee;

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + Number(item.quantity), 0),
    subtotal,
    fee,
    total
  };
}

async function getUserCart(userId) {
  const existingCart = await Cart.findOne({ userId });
  if (existingCart) {
    return existingCart;
  }

  return Cart.create({
    userId,
    items: []
  });
}

async function resolveLineItem(input) {
  if (input.productId) {
    const product = await Product.findOne({ productId: input.productId });

    if (!product) {
      throw new Error("Selected product was not found");
    }

    return {
      productId: product.productId,
      name: product.name,
      price: Number(product.price),
      image: product.image || "",
      category: product.category || "",
      quantity: Math.max(1, Number(input.quantity || 1))
    };
  }

  if (!input.name || input.price === undefined) {
    throw new Error("Each item needs a productId or a name and price");
  }

  return {
    productId: "",
    name: input.name,
    price: Number(input.price),
    image: input.image || "",
    category: input.category || "",
    quantity: Math.max(1, Number(input.quantity || 1))
  };
}

module.exports = {
  buildCartSummary,
  getUserCart,
  resolveLineItem
};
