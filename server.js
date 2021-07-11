require("dotenv").config({ path: "./config.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// connect DB
connectDB();
const app = express();

app.use(express.json());
app.use(cors());
// redirect to auth routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/payment", require("./routes/payment"));

// Error Handler (last piece of middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged error: ${err}`);
  server.close(() => {
    process.exit(1);
  });
});
