const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const { authRateLimit, otpRateLimit } = require("../middleware/rateLimitMiddleware");

router.post("/register", authRateLimit, authController.register);
router.post("/resend-otp", otpRateLimit, authController.resendOtp);
router.post("/verify-otp", otpRateLimit, authController.verifyOtp);
router.post("/login", authRateLimit, authController.login);
router.post("/forgot-password", authRateLimit, authController.forgotPassword);
router.post("/reset-password", authRateLimit, authController.resetPassword);

// Protected Admin Routes
router.get("/users", verifyToken, verifyAdmin, authController.getAllUsers);
router.put(
  "/update-role",
  verifyToken,
  verifyAdmin,
  authController.updateUserRole,
);
router.delete(
  "/users/:id",
  verifyToken,
  verifyAdmin,
  authController.deleteUser,
);

module.exports = router;
