const express = require("express");
const router = express.Router();

const {sendAutoReminders} = require("../controllers/reminderController");

router.get("/send-reminders", sendAutoReminders);

module.exports = router;