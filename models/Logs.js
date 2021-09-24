const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  operator: {
    type: String,
  },

  userName: {
    type: String,
  },

  userId: {
    type: String,
  },

  event: {
    type: String,
  },

  time: {
    type: Date,
  },
});

LogSchema.pre("save", async (next) => {
  next();
});

const Logs = mongoose.model("Logs", LogSchema);

module.exports = Logs;
