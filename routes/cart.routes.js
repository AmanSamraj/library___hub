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

router.get("/", getCart);
router.post("/items", addCartItem);
router.patch("/items/:itemKey", updateCartItem);
router.delete("/items/:itemKey", deleteCartItem);
router.delete("/", clearCart);

module.exports = router;
