const Event = require('../models/Events');
const ErrorResponse = require('../utils/errorResponse');

exports.getEvents = async (req, res) => {
  try {
    await Event.find({}, (error, events) => {
      const eventMap = {};
      events.forEach((event) => {
        eventMap[event._id] = event;
      });
      res.send(eventMap);
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      info: e.message,
    });
  }
};

exports.addEvents = async (req, res, next) => {
  const {
    eventName, eventLocation, eventDescription, startTime, endTime,
  } = req.body;

  try {
    const { isAdmin } = req.user;

    if (!isAdmin) {
      return next(new ErrorResponse('You are not admin', 401));
    }

    const event = await Event.create({
      eventName, eventLocation, eventDescription, startTime, endTime,
    });
    res.status(200).json({
      success: true,
      data: `${eventName} Added.`,
    });
  } catch (e) {
    next(e);
  }
};

exports.deleteEvents = async (req, res, next) => {
  const { _id } = req.body;

  try {
    const { isAdmin } = req.user;
    // console.log(isAdmin);

    if (!isAdmin) {
      return next(new ErrorResponse('You are not admin', 401));
    }
    const selectedEvent = await Event.findById(_id);

    if (!selectedEvent) {
      return next(new ErrorResponse('Event does not exist', 401));
    }

    await Event.findByIdAndRemove(_id, (error, data) => {
      if (error) {
        return next(error);
      }
      res.status(200).json({
        success: true,
        data: `${_id} Deleted.`,
      });
    });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};