const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, adminController.createOrder);

module.exports = router;
