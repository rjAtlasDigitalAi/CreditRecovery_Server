

const XLSX = require("xlsx");
const Customer = require("../models/Customer");

// Convert Excel Date → JS Date
const parseExcelDate = (value) => {
  if (!value) return null;

  // If Excel serial number
  if (typeof value === "number") {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }

  // If string date
  const date = new Date(value);
  return isNaN(date) ? null : date;
};

// Normalize header keys
const normalizeKeys = (row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    const newKey = key.toLowerCase().trim();
    normalized[newKey] = row[key];
  });
  return normalized;
};

// 📤 Upload & Preview Excel
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📂 Uploaded File:", req.file.originalname);

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    console.log("📑 Sheet:", sheetName);

    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    console.log("📊 Raw Excel Data");
    console.table(rows);
    console.log(rows,"rowssss");
    

    const formatted = rows.map((row, index) => {
      const r = normalizeKeys(row);

      
      

      const data = {
        name: String(r["name"] || "").trim(),
        phone: String(r["phone"] || "").trim(),
        totalCredit: Number(r["total credit"] || r["credit"] || 0),
        paidAmount: Number(r["paid"] || r["paid amount"] || 0),
        balance: Number(r["balance"] || 0),
        dueDate: parseExcelDate(r["due date"]),
        status:
          String(r["status"]||"").toUpperCase(),
      };

      console.log(`📌 Row ${index + 1}`, data);

      return data;
    });

    console.log("✅ Cleaned Excel Data");
    console.table(formatted);

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Excel parsing error:", error);
    res.status(500).json({ message: "Excel parsing failed" });
  }
};




// 💾 Save Confirmed Data
exports.saveExcelData = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    console.log("📥 Data received");
    console.table(req.body);

    const sanitizedData = req.body.map((item, index) => {
      const data = {
        name: String(item.name || "").trim(),
        phone: String(item.phone || "").trim(),
        totalCredit: Number(item.totalCredit || 0),
        paidAmount: Number(item.paidAmount || 0),
        balance: Number(item.balance || 0),
        dueDate: item.dueDate ? new Date(item.dueDate) : null,
        status:
          String(item.status || "").toUpperCase() ,
      };

      console.log(`💾 Saving Row ${index + 1}`, data);

      return data;
    });

    console.log("🚀 Final Data");
    console.table(sanitizedData);

    await Customer.insertMany(sanitizedData);

    console.log("✅ Insert Success");

    res.status(200).json({
      success: true,
      message: "Data saved successfully",
    });
  } catch (error) {
    console.error("❌ Saving failed:", error);
    res.status(500).json({ message: "Saving failed" });
  }
};

