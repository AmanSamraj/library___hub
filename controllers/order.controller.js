const Order = require("../models/order_model");
const { buildCartSummary, getUserCart, resolveLineItem } = require("../services/cart.service");
const { createId } = require("../utils/id.util");
const { serializeOrder } = require("../utils/serializers.util");

async function createOrder(req, res) {
  try {
    const cart = await getUserCart(req.user._id);
    const itemsInput = Array.isArray(req.body.items) && req.body.items.length ? req.body.items : cart.items;

    if (!itemsInput.length) {
      return res.status(400).json({ message: "No items were provided for this order" });
    }

    const items = [];
    for (const item of itemsInput) {
      items.push(await resolveLineItem(item));
    }

    const shippingAddress = req.body.shippingAddress || req.user.defaultAddress;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.line1 || !shippingAddress.phone) {
      return res.status(400).json({ message: "A shipping address is required before placing an order" });
    }

    const payment = {
      method: String(req.body.paymentMethod || "upi"),
      details: req.body.paymentDetails || {}
    };

    const summary = buildCartSummary(items);
    const order = await Order.create({
      orderId: createId("order"),
      userId: req.user._id,
      items,
      shippingAddress,
      payment,
      pricing: {
        subtotal: summary.subtotal,
        fee: summary.fee,
        total: summary.total
      },
      status: "placed"
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order: serializeOrder(order)
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getOrders(req, res) {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.json({
    count: orders.length,
    orders: orders.map(serializeOrder)
  });
}

async function getOrder(req, res) {
  const order = await Order.findOne({ orderId: req.params.id, userId: req.user._id });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({
    order: serializeOrder(order)
  });
}

module.exports = {
  createOrder,
  getOrders,
  getOrder
};
