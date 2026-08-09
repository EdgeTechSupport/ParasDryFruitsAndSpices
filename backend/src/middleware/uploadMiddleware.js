const multer = require("multer");

const imageOnly = (_req, file, callback) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    return callback(null, true);
  }

  callback(new Error("Only image files can be uploaded."));
};

const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  fileFilter: imageOnly,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});
