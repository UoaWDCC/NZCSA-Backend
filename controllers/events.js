const Event = require('../models/Events');
const ErrorResponse = require('../utils/errorResponse');

// Normal User API functions:
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

exports.signUpRSVP = async (req, res, next) => {
  const { eventId } = req.body;

  try {
    const { user } = req;

    const lst = user.attendedEvents;

    if (lst.includes(eventId)) {
      return next(new ErrorResponse('You have signed this event', 401));
    }

    user.attendedEvents.push(eventId);

    await user.save();
    res.status(200).json({
      success: true,
      data: `event ${eventId} Added.`,
    });
  } catch (e) {
    next(e);
  }
};

// exports.cancelEvents = async (req, res, next) => {
//   const { eventId } = req.body;

//   try {
//     const { user } = req;

//     const lst = user.attendedEvents;

//     if (!lst.includes(eventId)) {
//       return next(new ErrorResponse('You have not signed this event', 401));
//     }

//     user.attendedEvents.push(eventId);

//     await user.save();
//     res.status(200).json({
//       success: true,
//       data: `event ${eventId} Added.`,
//     });
//   } catch (e) {
//     next(e);
//   }
// };

// Admin User API Functions:
exports.addEvents = async (req, res, next) => {
  const {
    eventName, eventLocation, eventPrice, eventDescription, startTime, eventImgUrl,
  } = req.body;

  try {
    const { isAdmin } = req.user;

    if (!isAdmin) {
      return next(new ErrorResponse('You are not admin', 401));
    }

    await Event.create({
      eventName, eventLocation, eventPrice, eventDescription, startTime, eventImgUrl,
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
  const { eventId } = req.params;

  try {
    const { isAdmin } = req.user;

    if (!isAdmin) {
      return next(new ErrorResponse('You are not admin', 401));
    }
    const selectedEvent = await Event.findById(eventId);

    if (!selectedEvent) {
      return next(new ErrorResponse('Event does not exist', 401));
    }

    await Event.findByIdAndRemove(eventId, (error, data) => {
      if (error) {
        return next(error);
      }
      res.status(200).json({
        success: true,
        data: `${eventId} Deleted.`,
      });
    });
  } catch (error) {
    next(error);
  }
};
