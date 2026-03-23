const express = require("express");
const { register, login, verifyOtp, me } = require("../controllers/auth.controller");
const { requireDatabase } = require("../middlewares/database.middleware");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", requireDatabase, register);
router.post("/login", requireDatabase, login);
router.post("/login/verify-otp", requireDatabase, verifyOtp);
router.get("/me", requireDatabase, authenticate, me);

module.exports = router;
