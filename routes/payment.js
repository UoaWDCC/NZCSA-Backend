const express = require("express");
const {
  makePayment,
  paymentNotification,
  validateRedirect,
} = require("../controllers/payment");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/make-payment").post(protect, makePayment);
router.route("/payment-update").post(protect, paymentNotification); // this is a webhook to listen for payment status, Latipay server will call this endpoint
router.route("/validate-redirect").post(protect, validateRedirect);

module.exports = router;
