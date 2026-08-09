const prisma = require("../lib/prisma");

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

exports.getCoupons = async (_req, res) => {
  try {
    res.json(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }));
  } catch (error) {
    console.error("List-coupons error:", error);
    res.status(500).json({ message: "Unable to load coupons." });
  }
};

exports.createCoupon = async (req, res) => {
  const code = normalizeCode(req.body.code);
  const discount = Number(req.body.discount);
  const minimumAmount = Number(req.body.minimumAmount || 0);
  if (!/^[A-Z0-9_-]{3,30}$/.test(code) || !Number.isInteger(discount) || discount < 1 || discount > 90 || !Number.isFinite(minimumAmount) || minimumAmount < 0) {
    return res.status(400).json({ message: "Use a 3–30 character coupon code and a discount between 1% and 90%." });
  }
  try {
    const coupon = await prisma.coupon.create({ data: { code, discount, minimumAmount } });
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ message: "That coupon code already exists." });
    console.error("Create-coupon error:", error);
    res.status(500).json({ message: "Unable to create coupon." });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: "Coupon deleted." });
  } catch (error) {
    res.status(error.code === "P2025" ? 404 : 500).json({ message: "Unable to delete coupon." });
  }
};

exports.validateCoupon = async (req, res) => {
  const code = normalizeCode(req.body.code);
  const coupon = await prisma.coupon.findFirst({ where: { code, active: true } });
  if (!coupon) return res.status(404).json({ message: "Coupon is invalid or inactive." });
  const subtotal = Number(req.body.subtotal);
  if (!Number.isFinite(subtotal) || subtotal < coupon.minimumAmount) return res.status(400).json({ message: `This coupon requires a minimum order of ₹${coupon.minimumAmount}.` });
  res.json({ code: coupon.code, discount: coupon.discount, minimumAmount: coupon.minimumAmount });
};

exports.getActiveCoupons = async (_req, res) => {
  res.json(await prisma.coupon.findMany({ where: { active: true }, select: { id: true, code: true, discount: true, minimumAmount: true }, orderBy: { createdAt: "desc" } }));
};
