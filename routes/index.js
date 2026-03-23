const express = require("express");
const authRoutes = require("./auth.routes");
const catalogRoutes = require("./catalog.routes");
const cartRoutes = require("./cart.routes");
const checkoutRoutes = require("./checkout.routes");
const orderRoutes = require("./order.routes");
const healthRoutes = require("./health.routes");

const router = express.Router();

router.use(authRoutes);
router.use(catalogRoutes);
router.use(cartRoutes);
router.use(checkoutRoutes);
router.use(orderRoutes);
router.use(healthRoutes);

module.exports = router;
