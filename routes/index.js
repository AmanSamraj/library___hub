const express = require("express");
const authRoutes = require("./auth.routes");
const catalogRoutes = require("./catalog.routes");
const cartRoutes = require("./cart.routes");
const checkoutRoutes = require("./checkout.routes");
const orderRoutes = require("./order.routes");
const healthRoutes = require("./health.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use(catalogRoutes);
router.use("/cart", cartRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/orders", orderRoutes);
router.use(healthRoutes);

module.exports = router;
