const { listCategories, listProducts, getProductById, createProduct } = require("../services/catalog.service");

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

async function addProduct(req, res) {
  try {
    const response = await createProduct(req.body);
    res.status(201).json(response);
  } catch (error) {
    const statusCode = /already exists/i.test(error.message)
      ? 409
      : /MongoDB is not connected/i.test(error.message)
        ? 503
        : 400;

    res.status(statusCode).json({ message: error.message });
  }
}

module.exports = {
  getCategories,
  getProducts,
  getProduct,
  addProduct
};
