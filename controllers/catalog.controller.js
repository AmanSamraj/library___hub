const { listCategories, listProducts, getProductById } = require("../services/catalog.service");

async function getCategories(req, res) {
  const response = await listCategories();
  res.json(response);
}

async function getProducts(req, res) {
  const response = await listProducts(req.query.search, req.query.category);
  res.json(response);
}

async function getProduct(req, res) {
  try {
    const response = await getProductById(req.params.id);
    res.json(response);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

module.exports = {
  getCategories,
  getProducts,
  getProduct
};
