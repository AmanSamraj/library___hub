const { getDatabaseStatus } = require("../config/database");

function getHealth(req, res) {
  res.json({
    status: "ok",
    service: "library-hub-backend",
    database: getDatabaseStatus(),
    time: new Date().toISOString()
  });
}

module.exports = {
  getHealth
};
