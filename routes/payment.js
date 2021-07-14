const express = require("express");
const {
  makePayment,
  paymentNotification,
  validateRedirect,
  createOrder,
  getOrder,
} = require("../controllers/payment");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/make-payment").post(protect, makePayment);
router.route("/payment-update").post(paymentNotification); // this is a webhook to listen for payment status, Latipay server will call this endpoint
router.route("/validate-redirect").post(protect, validateRedirect);
router.route("/create-order").post(protect, createOrder); // called when user starts payment process
router.route("/get-order").get(protect, getOrder);

module.exports = router;
