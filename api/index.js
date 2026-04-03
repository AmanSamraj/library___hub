const { app, connectDatabase } = require("../server");

let databaseInitPromise = null;

function ensureDatabase() {
  if (!databaseInitPromise) {
    databaseInitPromise = connectDatabase().catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      return null;
    });
  }

  return databaseInitPromise;
}

ensureDatabase();

module.exports = async function handler(req, res) {
  ensureDatabase();

  try {
    return app(req, res);
  } catch (error) {
    console.error("API handler crashed:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }
  }
};
