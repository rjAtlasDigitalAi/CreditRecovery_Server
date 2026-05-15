

const express = require("express");
const router = express.Router();
const multer = require("multer");

const { uploadPhoto,getAllOcrData} = require("../controllers/photoController");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
});

router.post("/upload-photo", upload.single("image"), uploadPhoto);
router.get("/ocr-data", getAllOcrData);
module.exports = router;