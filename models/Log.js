const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
    
});

LogSchema.pre("save", async (next) => {
  next();
});

const Logs = mongoose.model("Logs", LogSchema);

module.exports = Logs;
