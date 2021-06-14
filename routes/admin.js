const express = require('express');
const { addEvents, deleteEvents } = require('../controllers/events');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/add-events').post(protect, addEvents);
router.route('/delete-events').delete(protect, deleteEvents);

module.exports = router;
