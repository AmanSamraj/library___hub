const express = require("express");
const { createOrder, getOrders, getOrder } = require("../controllers/order.controller");
const { requireDatabase } = require("../middlewares/database.middleware");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireDatabase, authenticate);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);

module.exports = router;
