const express = require("express");
const { makePayment, paymentNotification } = require("../controllers/payment");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/make-payment").post(protect, makePayment);
// router.route("/payment-notification").post(protect, paymentNotification);
router.route("/confirm").post(paymentNotification);

module.exports = router;
