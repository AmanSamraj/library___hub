const express = require("express");
const { register, login, verifyRegisterOtp, me } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post("/login", login);
router.get("/me", authenticate, me);

module.exports = router;
