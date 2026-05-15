

const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Absolute uploads folder path
const uploadDir = path.join(__dirname, "..", "uploads");

// Create folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);   // ✅ absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;