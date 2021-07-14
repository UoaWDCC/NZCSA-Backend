const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  merchantReference: {
    type: String,
    required: [true, "There must be reference for order"],
    unique: true,
  },

  userId: {
    type: String,
    required: [true, "Please provide user id"],
  },

  orderStatus: {
    type: String,
    required: [true, "Please provide order status"],
  },

  paymentMethod: {
    type: String,
    required: [true, "please provide payment method"],
  },

  eventId: {
    type: String,
  },

  payTime: {
    type: String,
  },

  orderType: {
    type: String,
  },
});

OrderSchema.pre("save", async (next) => {
  next();
});

const Orders = mongoose.model("Orders", OrderSchema);

module.exports = Orders;
