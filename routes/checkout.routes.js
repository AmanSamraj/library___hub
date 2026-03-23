const express = require("express");
const { getAddress, saveAddress } = require("../controllers/checkout.controller");
const { requireDatabase } = require("../middlewares/database.middleware");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireDatabase, authenticate);

router.get("/checkout/address", getAddress);
router.post("/checkout/address", saveAddress);

module.exports = router;
