const crypto = require("crypto");

function createId(prefix) {
  return prefix + "-" + crypto.randomBytes(6).toString("hex");
}

module.exports = {
  createId
};
