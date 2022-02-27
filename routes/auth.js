const express = require("express");
const {
  register,
  login,
  forgotpassword,
  resetpassword,
  checkGoogleAuth,
} = require("../controllers/auth");

const router = express.Router();

// Normal Auth
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotpassword);
router.route("/resetpassword/:resetToken").put(resetpassword);

// GoogleAuth
router.route("/googleauth").post(checkGoogleAuth);

module.exports = router;
