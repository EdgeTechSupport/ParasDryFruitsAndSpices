const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const couponController = require("../controllers/couponController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken, verifyAdmin);

router.get("/orders", adminController.getAllOrders);
router.put("/orders/status", adminController.updateOrderStatus);
router.get("/coupons", couponController.getCoupons);
router.post("/coupons", couponController.createCoupon);
router.delete("/coupons/:id", couponController.deleteCoupon);

module.exports = router;
