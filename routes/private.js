const express = require("express");

const { getEvents, signUpRSVP } = require("../controllers/events");
const {
  signUpMembership,
  getPrivateData,
  getUserData,
} = require("../controllers/private");

const { addUserToGooleSheet } = require("../controllers/googleSheets");

const { addGoogleCalendarEvent } = require("../controllers/googleCalendar");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/get-events-info").get(getEvents);
router.route("/get-logged-in-user").get(protect, getUserData);

router.route("/sign-up-membership").post(protect, signUpMembership);
router.route("/get-user-info").get(protect, getPrivateData);
router.route("/sign-up-event").post(protect, signUpRSVP);
// router.route('/cancel-event').post(protect, cancelRSVP);
router.route("/save-to-google-sheet").post(protect, addUserToGooleSheet);
router
  .route("/add-gooogle-calendar-event")
  .post(protect, addGoogleCalendarEvent);

module.exports = router;
