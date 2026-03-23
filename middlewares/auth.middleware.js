const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const { SECRET } = require("../config/env");

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "User account not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  authenticate
};
