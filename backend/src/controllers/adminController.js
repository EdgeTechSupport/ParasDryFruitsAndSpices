const prisma = require("../lib/prisma");
const ORDER_STATUSES = ["PENDING_WHATSAPP", "CONFIRMED", "SHIPPED", "DELIVERED"];

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, couponCode } = req.body;
    if (!Array.isArray(items) || items.length === 0 || !Number.isFinite(Number(totalAmount)) || Number(totalAmount) < 0) {
      return res.status(400).json({ message: "A non-empty order and valid total are required." });
    }

    const productIds = items.map((item) => item.id).filter(Boolean);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } }, include: { variants: true } });
    const productById = new Map(products.map((product) => [product.id, product]));
    if (productIds.some((id) => !productById.has(id))) return res.status(400).json({ message: "One or more products are unavailable." });

    const orderItems = items.map((item) => {
      const product = productById.get(item.id);
      const quantity = Number(item.qty);
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Invalid order quantity.");
      const variant = item.selectedVariantId
        ? product.variants.find((candidate) => candidate.id === item.selectedVariantId)
        : null;
      if (item.selectedVariantId && !variant) throw new Error("Selected product weight is unavailable.");
      const price = Number(variant?.price ?? product.price);
      if (variant && quantity > variant.stock) throw new Error("Requested quantity exceeds available stock.");
      if (!Number.isFinite(price) || price < 0) throw new Error("Invalid product price.");
      return { productId: product.id, quantity, price };
    });
    const calculatedTotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const coupon = couponCode
      ? await prisma.coupon.findFirst({ where: { code: String(couponCode).trim().toUpperCase(), active: true } })
      : null;
    if (couponCode && !coupon) return res.status(400).json({ message: "Coupon is invalid or inactive." });
    if (coupon && calculatedTotal < coupon.minimumAmount) return res.status(400).json({ message: `This coupon requires a minimum order of ₹${coupon.minimumAmount}.` });
    const finalTotal = coupon ? Math.round(calculatedTotal * (100 - coupon.discount)) / 100 : calculatedTotal;
    const order = await prisma.$transaction(async (tx) => {
      if (coupon) await tx.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
      for (const [index, item] of orderItems.entries()) {
        const cartItem = items[index];
        if (cartItem?.selectedVariantId) await tx.productVariant.update({ where: { id: cartItem.selectedVariantId }, data: { stock: { decrement: item.quantity } } });
        else await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
      return tx.order.create({
        data: { userId: req.user.id, totalAmount: finalTotal, items: { create: orderItems } },
        include: { items: { include: { product: true } } },
      });
    });
    res.status(201).json(order);
  } catch (error) {
    console.error("Create-order error:", error);
    res.status(400).json({ message: "Unable to create the order." });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !ORDER_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "A valid orderId and status are required." });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
