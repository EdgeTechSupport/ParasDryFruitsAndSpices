const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const couponController = require("../controllers/couponController");

// Public Catalog Access
router.get("/", productController.getProducts);
router.get("/coupons", couponController.getActiveCoupons);
router.post("/validate-coupon", couponController.validateCoupon);

// Admin-Only Operations
router.post("/", verifyToken, verifyAdmin, upload.array("images", 5), productController.createProduct);
router.put("/:id", verifyToken, verifyAdmin, upload.array("images", 5), productController.updateProduct);
router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  productController.deleteProduct,
);

module.exports = router;
