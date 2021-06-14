const express = require('express');
const { getEvents } = require('../controllers/events');
const { signUpRSVP, cancelRSVP } = require('../controllers/rsvp');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/get-events-info').get(getEvents);

router.route('/sign-up-event').post(protect, signUpRSVP);
// router.route('/cancel-event').post(protect, cancelRSVP);

module.exports = router;
