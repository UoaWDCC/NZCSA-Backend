const { register, login, forgotpassword, resetpassword } = require('../controllers/auth');


const express = require('express');
const router = express.Router();


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotpassword);
// resetpassword token
router.route("/resetpassword/:resetToken").put(resetpassword);


module.exports = router;