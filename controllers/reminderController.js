
const axios = require("axios");
const Customer = require("../models/Customer");
const MessageLog = require("../models/MessageLog");

exports.sendAutoReminders = async (req, res) => {
  try {
    console.log("⏰ Running Auto Reminder API...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const customers = await Customer.find({
      dueDate: { $lte: today },
      status: { $ne: "Paid" }
    });

    console.log("📊 Customers Found:", customers.length);

    for (const customer of customers) {

      let phone = String(customer.phone).replace(/\D/g, "");

      if (!phone.startsWith("91")) {
        phone = "91" + phone;
      }

      const message = `Hello ${customer.name}, your payment of ₹${customer.balance} is due. Please pay as soon as possible.`;

      const payload = {
        number: phone,
        type: "text",
        message,
        instance_id: "68E0E2878A990",
        access_token: "68de6bd371bd8",
      };

      try {
        await axios.post("https://waichat.com/api/send", payload);

        console.log("✅ Sent to:", phone);

        await MessageLog.create({
          customerId: customer._id,
          customerName: customer.name,
          phone,
          message,
          status: "Sent",
        });

      } catch (err) {
        console.error("❌ Failed:", phone);

        await MessageLog.create({
          customerId: customer._id,
          customerName: customer.name,
          phone,
          message,
          status: "Failed",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Reminders processed successfully"
    });

  } catch (error) {
    console.error("❌ Reminder API Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};