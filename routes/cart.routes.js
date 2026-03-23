const express = require("express");
const {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart
} = require("../controllers/cart.controller");
const { requireDatabase } = require("../middlewares/database.middleware");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireDatabase, authenticate);

router.get("/cart", getCart);
router.post("/cart/items", addCartItem);
router.patch("/cart/items/:itemKey", updateCartItem);
router.delete("/cart/items/:itemKey", deleteCartItem);
router.delete("/cart", clearCart);

module.exports = router;
