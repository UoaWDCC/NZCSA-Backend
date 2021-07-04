const express = require("express");
const {
  showMemberList,
  promoToMember,
  deleteMember,
  shwoEventUserInfo,
} = require("../controllers/admin");
const {
  addEvents,
  deleteEvents,
  modifyEvent,
} = require("../controllers/events");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/add-events").post(protect, addEvents);
router.route("/modify-events").post(protect, modifyEvent);
router.route("/delete-events/:eventId").delete(protect, deleteEvents);

router.route("/show-event-user-info").get(protect, shwoEventUserInfo);
router.route("/show-member-list").get(protect, showMemberList);
router.route("/promo-to-member").post(protect, promoToMember);
router.route("/delete-member/:userId").delete(protect, deleteMember);

module.exports = router;
