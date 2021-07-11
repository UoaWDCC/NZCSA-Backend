const express = require("express");
const { makePayment } = require("../controllers/payment");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/make-payment").post(protect, makePayment);

module.exports = router;
