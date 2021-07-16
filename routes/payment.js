const express = require("express");
const {
  makePayment,
  paymentNotification,
  validateRedirect,
  createOrder,
  getOrder,
  deleteAllOrders,
  removeMembership,
  removeFromEvent,
} = require("../controllers/payment");

const router = express.Router();

const { protect } = require("../middleware/auth");

// Api functions for use by user
router.route("/make-payment").post(protect, makePayment);
router.route("/payment-update").post(paymentNotification); // this is a webhook to listen for payment status, Latipay server will call this endpoint
router.route("/validate-redirect").post(protect, validateRedirect);
router.route("/create-order").post(protect, createOrder); // called when user starts payment process
router.route("/get-order").get(protect, getOrder);

// Api functions to test payment for developers
router.route("/delete-all-orders").post(protect, deleteAllOrders);
router.route("/remove-membership").post(protect, removeMembership);
router.route("/remove-from-event").put(protect, removeFromEvent);

module.exports = router;
