const RSVP = require('../models/RSVP');
const ErrorResponse = require('../utils/errorResponse');

exports.signUpRSVP = async (req, res, next) => {
  const { eventId } = req.body;

  try {
    const { _id } = req.user;

    let eventRSVP = await RSVP.findOne({ eventID: eventId });

    if (!eventRSVP) {
      eventRSVP = await RSVP.create({ eventID: eventId });
    }

    const checkId = await RSVP.findOne({ 'userList.userId': _id });

    if (checkId) {
      return next(new ErrorResponse(`User ${_id} has signed for this event`, 401));
    }

    await eventRSVP.userList.push({
      userId: _id,
      isPaid: true,
    });

    await eventRSVP.save();

    res.status(200).json({
      success: true,
      data: `User ${_id} Added.`,
    });
  } catch (e) {
    next(e);
  }
};

exports.cancelRSVP = async (req, res, next) => {
  const { eventId } = req.body;

  try {
    const { _id } = req.user;

    let eventRSVP = await RSVP.findOne({ eventID: eventId });

    if (!eventRSVP) {
      eventRSVP = await RSVP.create({ eventID: eventId });
    }

    const checkId = await RSVP.findOne({ 'userList.userId': _id });

    if (checkId) {
      return next(new ErrorResponse(`User ${_id} has signed for this event`, 401));
    }

    await eventRSVP.userList.push({
      userId: _id,
      isPaid: true,
    });

    await eventRSVP.save();

    res.status(200).json({
      success: true,
      data: `User ${_id} Added.`,
    });
  } catch (e) {
    next(e);
  }
};
