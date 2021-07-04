const express = require("express");

const { getEvents, signUpRSVP } = require("../controllers/events");
const { signUpMembership, getPrivateData } = require("../controllers/private");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/get-events-info").get(getEvents);

router.route("/sign-up-membership").post(protect, signUpMembership);
router.route("/get-user-info").get(protect, getPrivateData);
router.route("/sign-up-event").post(protect, signUpRSVP);
// router.route('/cancel-event').post(protect, cancelRSVP);

module.exports = router;
