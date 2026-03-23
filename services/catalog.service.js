const fs = require("fs");
const path = require("path");
const Product = require("../models/productmodel");
const { isDatabaseReady } = require("../config/database");
const { formatProduct } = require("../utils/serializers.util");

let fallbackProductsCache = null;

function getProductsFilePath() {
  return path.join(__dirname, "..", "data", "products.json");
}

function getFallbackProducts() {
  if (fallbackProductsCache) {
    return fallbackProductsCache;
  }

  const filePath = getProductsFilePath();
  if (!fs.existsSync(filePath)) {
    fallbackProductsCache = [];
    return fallbackProductsCache;
  }

  const rawProducts = JSON.parse(fs.readFileSync(filePath, "utf8"));
  fallbackProductsCache = Array.isArray(rawProducts) ? rawProducts.map(formatProduct) : [];
  return fallbackProductsCache;
}

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) {
    return;
  }

  const rawProducts = getFallbackProducts();
  if (!rawProducts.length) {
    return;
  }

  await Product.insertMany(
    rawProducts.map((product) => ({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      category: product.category,
      badge: product.badge || "",
      description: product.description || "",
      image: product.image || "",
      inventory: Number(product.inventory || 0),
      rating: Number(product.rating || 0)
    }))
  );
}

async function listCategories() {
  if (!isDatabaseReady()) {
    return {
      categories: Array.from(new Set(getFallbackProducts().map((product) => product.category).filter(Boolean))).sort(),
      source: "fallback"
    };
  }

  const categories = await Product.distinct("category");
  categories.sort();
  return { categories };
}

async function listProducts(search, category) {
  const normalizedSearch = String(search || "").trim();
  const normalizedCategory = String(category || "").trim();

  if (!isDatabaseReady()) {
    const searchTerm = normalizedSearch.toLowerCase();
    const categoryTerm = normalizedCategory.toLowerCase();
    const products = getFallbackProducts().filter((product) => {
      const matchesSearch = !searchTerm || [
        product.name,
        product.category,
        product.description,
        product.badge
      ].join(" ").toLowerCase().includes(searchTerm);
      const matchesCategory = !categoryTerm || String(product.category || "").toLowerCase() === categoryTerm;
      return matchesSearch && matchesCategory;
    });

    return {
      count: products.length,
      products,
      source: "fallback"
    };
  }

  const query = {};

  if (normalizedSearch) {
    query.$or = [
      { name: new RegExp(normalizedSearch, "i") },
      { category: new RegExp(normalizedSearch, "i") },
      { description: new RegExp(normalizedSearch, "i") },
      { badge: new RegExp(normalizedSearch, "i") }
    ];
  }

  if (normalizedCategory) {
    query.category = new RegExp("^" + normalizedCategory.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
  }

  const products = await Product.find(query).sort({ createdAt: 1 });
  return {
    count: products.length,
    products: products.map(formatProduct)
  };
}

async function getProductById(productId) {
  if (!isDatabaseReady()) {
    const product = getFallbackProducts().find((entry) => entry.id === productId);

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      product,
      source: "fallback"
    };
  }

  const product = await Product.findOne({ productId });
  if (!product) {
    throw new Error("Product not found");
  }

  return {
    product: formatProduct(product)
  };
}

module.exports = {
  seedProducts,
  listCategories,
  listProducts,
  getProductById
};
