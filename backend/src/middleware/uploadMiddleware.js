const crypto = require("crypto");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, callback) => {
    callback(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const imageOnly = (_req, file, callback) => {
  if (file.mimetype.startsWith("image/")) return callback(null, true);
  callback(new Error("Only image files can be uploaded."));
};

module.exports = multer({
  storage,
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});
