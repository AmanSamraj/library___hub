const express = require("express");
const { getCategories, getProducts, getProduct, addProduct } = require("../controllers/catalog.controller");

const router = express.Router();

router.get("/categories", getCategories);
router.get("/products", getProducts);
router.post("/products", addProduct);
router.get("/products/:id", getProduct);

module.exports = router;
