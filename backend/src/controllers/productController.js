const crypto = require("crypto");
const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

const createStoragePath = (folder, file) => {
  const extension = file.originalname.includes(".")
    ? file.originalname
        .substring(file.originalname.lastIndexOf("."))
        .toLowerCase()
    : "";

  return `${folder}/${Date.now()}-${crypto.randomUUID()}${extension}`;
};

const getPublicUrl = (storagePath) => {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  return data.publicUrl;
};

const uploadImages = async (files, folder) => {
  const uploaded = [];

  try {
    for (const file of files) {
      const storagePath = createStoragePath(folder, file);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "31536000",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploaded.push({
        path: storagePath,
        url: getPublicUrl(storagePath),
      });
    }

    return uploaded;
  } catch (error) {
    // Clean up anything uploaded before the failure.
    if (uploaded.length) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove(uploaded.map((image) => image.path));
    }

    throw error;
  }
};

const getStoragePathFromUrl = (url) => {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;

  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.substring(index + marker.length));
};

const deleteStorageImages = async (urls) => {
  const paths = urls.map(getStoragePathFromUrl).filter(Boolean);

  if (!paths.length) {
    return;
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);

  if (error) {
    console.error("Supabase image deletion error:", error);
  }
};

const parseVariants = (rawVariants) => {
  let variants;

  try {
    variants = JSON.parse(rawVariants || "[]");
  } catch {
    throw new Error("Weight options are invalid.");
  }

  const parsedVariants = variants.map((variant) => ({
    weight: String(variant.weight || "").trim(),
    price: Number(variant.price),
    mrp: variant.mrp === "" || variant.mrp == null ? null : Number(variant.mrp),
    stock: Number(variant.stock),
  }));

  const invalidVariant =
    !parsedVariants.length ||
    parsedVariants.some(
      (variant) =>
        !variant.weight ||
        !Number.isFinite(variant.price) ||
        variant.price < 0 ||
        !Number.isFinite(variant.stock) ||
        !Number.isInteger(variant.stock) ||
        variant.stock < 0 ||
        (variant.mrp !== null &&
          (!Number.isFinite(variant.mrp) || variant.mrp < variant.price)),
    );

  if (invalidVariant) {
    throw new Error(
      "For each weight, MRP is optional but must be equal to or greater than the selling price.",
    );
  }

  return parsedVariants;
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        variants: true,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Unable to fetch products.",
    });
  }
};

// ============================================================
// CREATE PRODUCT
// ============================================================

exports.createProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const { title, description, category, isOrganic } = req.body;

    const files = req.files || [];

    if (!String(title || "").trim()) {
      return res.status(400).json({
        message: "Product name is required.",
      });
    }

    if (!files.length) {
      return res.status(400).json({
        message: "At least one product image is required.",
      });
    }

    const parsedVariants = parseVariants(req.body.variants);

    const firstVariant = parsedVariants[0];

    /*
      Create a unique folder for this product's images.

      We don't need the database product ID yet.
    */
    const imageFolder = `products/${crypto.randomUUID()}`;

    uploadedImages = await uploadImages(files, imageFolder);

    const product = await prisma.product.create({
      data: {
        title: title.trim(),

        description: String(description || "").trim(),

        price: firstVariant.price,

        mrp: firstVariant.mrp,

        unit: firstVariant.weight,

        stock: firstVariant.stock,

        imageUrl: uploadedImages[0].url,

        category: ["dry-fruits", "spices", "combos"].includes(category)
          ? category
          : "dry-fruits",

        isOrganic: isOrganic === true || isOrganic === "true",

        images: {
          create: uploadedImages.map((image, sortOrder) => ({
            url: image.url,
            sortOrder,
          })),
        },

        variants: {
          create: parsedVariants,
        },
      },

      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        variants: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);

    /*
      If database creation failed after the images
      were uploaded, remove those images.
    */
    if (uploadedImages.length) {
      await deleteStorageImages(uploadedImages.map((image) => image.url));
    }

    res.status(500).json({
      message: error.message || "Unable to create product.",
    });
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

exports.updateProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const { title, description, category, isOrganic } = req.body;

    const files = req.files || [];

    if (!String(title || "").trim()) {
      return res.status(400).json({
        message: "Product name is required.",
      });
    }

    const parsedVariants = parseVariants(req.body.variants);

    const firstVariant = parsedVariants[0];

    /*
      Get current product so we can remove its old
      Supabase images if new images are uploaded.
    */
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: req.params.id,
      },

      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    /*
      Only upload new images when the admin selected
      new files.

      Editing title/price/stock without selecting
      images keeps the existing gallery.
    */
    if (files.length) {
      const imageFolder = `products/${existingProduct.id}`;

      uploadedImages = await uploadImages(files, imageFolder);
    }

    const productData = {
      title: title.trim(),

      description: String(description || "").trim(),

      price: firstVariant.price,

      mrp: firstVariant.mrp,

      unit: firstVariant.weight,

      stock: firstVariant.stock,

      category: ["dry-fruits", "spices", "combos"].includes(category)
        ? category
        : "dry-fruits",

      isOrganic: isOrganic === true || isOrganic === "true",

      variants: {
        deleteMany: {},

        create: parsedVariants,
      },
    };

    /*
      If new images were uploaded:
      replace the entire image gallery.
    */
    if (uploadedImages.length) {
      productData.imageUrl = uploadedImages[0].url;

      productData.images = {
        deleteMany: {},

        create: uploadedImages.map((image, sortOrder) => ({
          url: image.url,
          sortOrder,
        })),
      };
    }

    const product = await prisma.product.update({
      where: {
        id: req.params.id,
      },

      data: productData,

      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        variants: true,
      },
    });

    /*
      Delete old Supabase images AFTER the database
      successfully points to the new ones.
    */
    if (uploadedImages.length) {
      await deleteStorageImages(
        existingProduct.images.map((image) => image.url),
      );
    }

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);

    /*
      If the update failed after uploading new files,
      remove those new files.
    */
    if (uploadedImages.length) {
      await deleteStorageImages(uploadedImages.map((image) => image.url));
    }

    res.status(error.code === "P2025" ? 404 : 500).json({
      message: error.message || "Unable to update product.",
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        images: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    /*
      Delete database record first.
      ProductImage rows cascade because your Prisma
      schema has onDelete: Cascade.
    */
    await prisma.product.delete({
      where: {
        id,
      },
    });

    /*
      Then delete the corresponding files from
      Supabase Storage.
    */
    await deleteStorageImages(product.images.map((image) => image.url));

    res.json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: error.message || "Unable to delete product.",
    });
  }
};
