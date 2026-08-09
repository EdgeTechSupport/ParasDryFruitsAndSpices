const prisma = require("../lib/prisma");

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create Product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, category, isOrganic } = req.body;
    const files = req.files || [];
    let variants;
    try {
      variants = JSON.parse(req.body.variants || "[]");
    } catch {
      return res.status(400).json({ message: "Weight options are invalid." });
    }
    const parsedVariants = variants.map((variant) => ({
      weight: String(variant.weight || "").trim(),
      price: Number(variant.price),
      mrp: variant.mrp === "" || variant.mrp == null ? null : Number(variant.mrp),
      stock: Number(variant.stock),
    }));
    const invalidVariant = !parsedVariants.length || parsedVariants.some((variant) => !variant.weight || !Number.isFinite(variant.price) || variant.price < 0 || !Number.isFinite(variant.stock) || !Number.isInteger(variant.stock) || variant.stock < 0 || (variant.mrp !== null && (!Number.isFinite(variant.mrp) || variant.mrp < variant.price)));
    if (!String(title || "").trim() || !files.length || invalidVariant) {
      return res
        .status(400)
        .json({ message: "Add a product name and image. For each weight, MRP is optional but must be equal to or greater than the selling price." });
    }

    const firstVariant = parsedVariants[0];
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrls = files.map((file) => `${baseUrl}/uploads/${file.filename}`);

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        description: String(description || "").trim(),
        price: firstVariant.price,
        mrp: firstVariant.mrp,
        unit: firstVariant.weight,
        stock: firstVariant.stock,
        imageUrl: imageUrls[0],
        category: ["dry-fruits", "spices", "combos"].includes(category) ? category : "dry-fruits",
        isOrganic: isOrganic === true || isOrganic === "true",
        images: { create: imageUrls.map((url, sortOrder) => ({ url, sortOrder })) },
        variants: { create: parsedVariants },
      },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, category, isOrganic } = req.body;
    const files = req.files || [];
    let variants;
    try { variants = JSON.parse(req.body.variants || "[]"); } catch { return res.status(400).json({ message: "Weight options are invalid." }); }
    const parsedVariants = variants.map((variant) => ({
      weight: String(variant.weight || "").trim(), price: Number(variant.price),
      mrp: variant.mrp === "" || variant.mrp == null ? null : Number(variant.mrp), stock: Number(variant.stock),
    }));
    const invalid = !String(title || "").trim() || !parsedVariants.length || parsedVariants.some((variant) => !variant.weight || !Number.isFinite(variant.price) || variant.price < 0 || !Number.isInteger(variant.stock) || variant.stock < 0 || (variant.mrp !== null && (!Number.isFinite(variant.mrp) || variant.mrp < variant.price)));
    if (invalid) return res.status(400).json({ message: "Enter valid product and weight details. MRP must not be below selling price." });
    const first = parsedVariants[0];
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const newUrls = files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        title: title.trim(), description: String(description || "").trim(), price: first.price, mrp: first.mrp, unit: first.weight, stock: first.stock,
        category: ["dry-fruits", "spices", "combos"].includes(category) ? category : "dry-fruits", isOrganic: isOrganic === true || isOrganic === "true",
        ...(newUrls.length ? { imageUrl: newUrls[0], images: { create: newUrls.map((url, sortOrder) => ({ url, sortOrder })) } } : {}),
        variants: { deleteMany: {}, create: parsedVariants },
      }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    });
    res.json(product);
  } catch (error) {
    res.status(error.code === "P2025" ? 404 : 500).json({ message: "Unable to update product." });
  }
};

// Admin: Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
