const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");



dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/photo", require("./routes/photoRoutes"));
app.use("/api/excel",require("./routes/excelRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/message-logs", require("./routes/messageLogRoutes"));
app.use("/api/reminders", require("./routes/reminderRoutes"));
app.use("/api/upload",require("./routes/photouploadRoutes"));
app.use("/api/cron", require("./routes/cronRoutes"));

app.get("/", (req, res) => res.send("Credit Recovery Server Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


