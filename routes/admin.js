const express = require('express');
const { showMemberList, promoToMember, deleteMember } = require('../controllers/admin');
const { addEvents, deleteEvents } = require('../controllers/events');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/add-events').post(protect, addEvents);
router.route('/delete-events').delete(protect, deleteEvents);

router.route('/show-event-user-info').delete(protect, deleteEvents);
router.route('/show-member-list').get(protect, showMemberList);
router.route('/promo-to-member').post(protect, promoToMember);
router.route('/delete-member').delete(protect, deleteMember);

module.exports = router;
