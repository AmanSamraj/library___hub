const { buildCartSummary, getUserCart, resolveLineItem } = require("../services/cart.service");

async function getCart(req, res) {
  const cart = await getUserCart(req.user._id);
  res.json(buildCartSummary(cart.items));
}

async function addCartItem(req, res) {
  try {
    const nextItem = await resolveLineItem(req.body);
    const cart = await getUserCart(req.user._id);
    const existingIndex = cart.items.findIndex((item) => {
      if (nextItem.productId) {
        return item.productId === nextItem.productId;
      }

      return item.name.toLowerCase() === nextItem.name.toLowerCase();
    });

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += nextItem.quantity;
    } else {
      cart.items.push(nextItem);
    }

    await cart.save();

    res.status(201).json({
      message: "Item added to cart",
      cart: buildCartSummary(cart.items)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateCartItem(req, res) {
  const quantity = Math.max(0, Number(req.body.quantity || 0));
  const itemKey = req.params.itemKey;
  const cart = await getUserCart(req.user._id);

  cart.items = cart.items
    .map((item) => {
      const matches = item.productId === itemKey || item.name === decodeURIComponent(itemKey);
      if (!matches) {
        return item;
      }

      return Object.assign({}, item.toObject ? item.toObject() : item, { quantity });
    })
    .filter((item) => item.quantity > 0);

  await cart.save();

  res.json({
    message: "Cart updated",
    cart: buildCartSummary(cart.items)
  });
}

async function deleteCartItem(req, res) {
  const itemKey = req.params.itemKey;
  const cart = await getUserCart(req.user._id);

  cart.items = cart.items.filter((item) => item.productId !== itemKey && item.name !== decodeURIComponent(itemKey));
  await cart.save();

  res.json({
    message: "Item removed from cart",
    cart: buildCartSummary(cart.items)
  });
}

async function clearCart(req, res) {
  const cart = await getUserCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.json({
    message: "Cart cleared",
    cart: buildCartSummary(cart.items)
  });
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart
};
