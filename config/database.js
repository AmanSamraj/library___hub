const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

let databaseReady = false;

async function connectDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in .env");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected successfully in datbase.js");
  const { seedProducts } = require("../services/catalog.service");
  await seedProducts();
  databaseReady = true;
}

function isDatabaseReady() {
  return databaseReady && mongoose.connection.readyState === 1;
}

function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}

module.exports = {
  connectDatabase,
  isDatabaseReady,
  getDatabaseStatus
};
