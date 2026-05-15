


const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  totalCredit: Number,
  paidAmount: Number,
  balance: Number,
  dueDate: String,
  status: String,
  
    // optional (for OCR tracking)
    rawText: {
      type: String
    },
    source: {
      type: String,
      default: "ocr"
    }
  
});

module.exports = mongoose.model("Customer", customerSchema);



