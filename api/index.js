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

module.exports = async function handler(req, res) {
  await ensureDatabase();

  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + req.url;
  }

  return app(req, res);
};
