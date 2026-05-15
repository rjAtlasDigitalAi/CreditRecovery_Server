


exports.getAllOcrData = async (req, res) => {
  try {

    const records = await OcrData.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: records.length,
      data: records
    });

  } catch (error) {

    console.error("FETCH OCR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch OCR data"
    });

  }
};


const visionClient = require("../config/vision");
const OcrData = require("../models/OcrData");
const sharp = require("sharp");

exports.uploadPhoto = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded"
      });
    }

    // 🔹 Improve OCR accuracy
    const processedImage = await sharp(req.file.buffer)
      .rotate()
      .trim()
      .resize({ width: 2500 })
      .grayscale()
      .normalize()
      .modulate({ brightness: 1.2, contrast: 1.3 })
      .median(1)
      .blur(0.3)
      .sharpen({ sigma: 1.8 })
      .toBuffer();

    // 🔹 OCR detection with bounding boxes
    const [result] = await visionClient.documentTextDetection({
      image: { content: processedImage }
    });

 console.log(result,"resulttttttttttttttt");
 
 

    if (!result.fullTextAnnotation) {
      return res.status(400).json({
        success: false,
        message: "No text detected"
      });
    }

    const extractedText = result.fullTextAnnotation.text;

    console.log("OCR TEXT:\n", extractedText);

    // 🔹 Collect words with coordinates
    const words = [];

    result.fullTextAnnotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        block.paragraphs.forEach(paragraph => {
          paragraph.words.forEach(word => {

            const text = word.symbols.map(s => s.text).join("");

            const x = word.boundingBox.vertices[0].x || 0;
            const y = word.boundingBox.vertices[0].y || 0;

            words.push({ text, x, y });

          });
        });
      });
    });

    // 🔹 Find value to the right of a field
    const findRightValue = (keyword) => {

      const fieldWord = words.find(w =>
        w.text.toLowerCase().includes(keyword)
      );

      if (!fieldWord) return null;

      const sameRow = words.filter(w =>
        Math.abs(w.y - fieldWord.y) < 30 && w.x > fieldWord.x
      );

      if (!sameRow.length) return null;

      sameRow.sort((a, b) => a.x - b.x);

      return sameRow.map(w => w.text).join(" ");
    };

    // 🔹 Extract values dynamically
    const nameValue = findRightValue("name");
    const balanceValue = findRightValue("balance");
    const creditValue = findRightValue("credit");
    const dateValue = findRightValue("date");

    // 🔹 Date parsing
    let dueDate = null;

    if (dateValue) {
      const dateMatch = dateValue.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);

      if (dateMatch) {
        const [d, m, y] = dateMatch[0].split("/");
        dueDate = new Date(`${y}-${m}-${d}`);
      }
    }

    // 🔹 Final parsed object
    const customer = {
      name: nameValue || "",
      balance: balanceValue ? Number(balanceValue.replace(/\D/g, "")) : 0,
      totalCredit: creditValue ? Number(creditValue.replace(/\D/g, "")) : 0,
      dueDate
    };

    console.log("PARSED CUSTOMER:", customer);

    // 🔹 Save to MongoDB
    const savedData = await OcrData.create({
      rawText: extractedText,
      customers: [customer],
      source: "photo"
    });

    res.json({
      success: true,
      data: savedData
    });

  } catch (error) {

    console.error("OCR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "OCR Processing Failed",
      error: error.message
    });

  }
};




