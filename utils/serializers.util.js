function sanitizeUser(user) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    defaultAddress: user.defaultAddress || null,
    createdAt: user.createdAt
  };
}

function formatProduct(product) {
  return {
    id: product.productId || product.id,
    name: product.name,
    price: Number(product.price),
    category: product.category,
    badge: product.badge || "",
    description: product.description || "",
    image: product.image || "",
    inventory: Number(product.inventory || 0),
    rating: Number(product.rating || 0)
  };
}

function serializeOrder(order) {
  return {
    id: order.orderId,
    userId: String(order.userId),
    items: order.items,
    shippingAddress: order.shippingAddress,
    payment: order.payment,
    pricing: order.pricing,
    status: order.status,
    createdAt: order.createdAt
  };
}

module.exports = {
  sanitizeUser,
  formatProduct,
  serializeOrder
};
