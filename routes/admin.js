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
const { checkAdmin } = require("../middleware/checkAdmin");

router.route("/add-events").post(protect, checkAdmin, addEvents);
router.route("/modify-events").post(protect, checkAdmin, modifyEvent);
router
  .route("/delete-events/:eventId")
  .delete(protect, checkAdmin, deleteEvents);

router
  .route("/show-event-user-info")
  .post(protect, checkAdmin, shwoEventUserInfo);
router.route("/show-member-list").get(protect, checkAdmin, showMemberList);
router.route("/promo-to-member").post(protect, checkAdmin, promoToMember);
router
  .route("/delete-member/:userId")
  .delete(protect, checkAdmin, deleteMember);

module.exports = router;
