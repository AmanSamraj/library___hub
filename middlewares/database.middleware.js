const { isDatabaseReady } = require("../config/database");

function requireDatabase(req, res, next) {
  if (isDatabaseReady()) {
    return next();
  }

  return res.status(503).json({
    message: "Database is currently unavailable. Static frontend is available, but account and checkout features are temporarily offline."
  });
}

module.exports = {
  requireDatabase
};
