const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins, methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "100kb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Paras Dry Fruits API Connected & Running");
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ message: "Invalid JSON request body." });
  if (error.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "Each image must be 5 MB or smaller." });
  if (error.message === "Only image files can be uploaded.") return res.status(400).json({ message: error.message });
  console.error("Unhandled server error:", error);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
