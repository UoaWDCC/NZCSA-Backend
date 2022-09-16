const Event = require("../models/Events");
const ErrorResponse = require("../utils/errorResponse");
const Log = require("../models/Logs");

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

    const event = await Event.findOne({ _id: eventId });

    if (!event) {
      return next(new ErrorResponse("Event not found", 404));
    }

    const lst = event.userList;

    // eslint-disable-next-line no-underscore-dangle
    if (lst.includes(user._id) || user.attendedEvents.includes(user._id)) {
      return next(new ErrorResponse("You have signed this event", 401));
    }

    user.attendedEvents.push(eventId);
    // eslint-disable-next-line no-underscore-dangle
    event.userList.push(user._id);
    await event.save();
    await user.save();
    res.status(200).json({
      success: true,
      data: `event ${eventId} Added.`,
    });
  } catch (e) {
    next(e);
  }
};

// Admin User API Functions:
exports.addEvents = async (req, res, next) => {
  const {
    eventName,
    eventLocation,
    eventPrice,
    eventDescription,
    startTime,
    eventImgUrl,
    wechatImgUrl,
    googleSheetUrl,
    eventGoogleForm,
  } = req.body;

  try {
    await Event.create({
      eventName,
      eventLocation,
      eventPrice,
      eventDescription,
      startTime,
      eventImgUrl,
      wechatImgUrl,
      googleSheetUrl,
      eventGoogleForm,
    });

    res.status(200).json({
      success: true,
      data: `${eventName} Added.`,
    });
    await Log.create({
      operator: req.user.firstname,
      event: "Created event",
      name: eventName,
      time: new Date().getTime(),
    });
  } catch (e) {
    next(e);
  }
};

exports.modifyEvent = async (req, res, next) => {
  const {
    eventId,
    eventName,
    eventLocation,
    eventPrice,
    eventDescription,
    startTime,
    eventImgUrl,
    wechatImgUrl,
    googleSheetUrl,
  } = req.body;

  try {
    const selectedEvent = await Event.findById(eventId);

    if (!selectedEvent) {
      return next(new ErrorResponse("Event does not exist", 404));
    }

    console.log(selectedEvent);

    selectedEvent.eventName = eventName;
    selectedEvent.eventLocation = eventLocation;
    selectedEvent.eventPrice = eventPrice;
    selectedEvent.eventDescription = eventDescription;
    selectedEvent.startTime = startTime;
    selectedEvent.eventImgUrl = eventImgUrl;
    selectedEvent.wechatImgUrl = wechatImgUrl;
    selectedEvent.googleSheetUrl = googleSheetUrl;

    await selectedEvent.save();

    res.status(200).json({
      success: true,
      data: `${eventName} Modified.`,
    });

    await Log.create({
      operator: req.user.firstname,
      event: "Modified event",
      name: eventName,
      id: eventId,
      time: new Date().getTime(),
    });
  } catch (e) {
    next(e);
  }
};

exports.deleteEvents = async (req, res, next) => {
  const { eventId } = req.params;
  // console.log(eventId);
  try {
    const selectedEvent = await Event.findById(eventId);

    if (!selectedEvent) {
      return next(new ErrorResponse("Event does not exist", 404));
    }

    await Event.findByIdAndUpdate(
      eventId,
      { isActive: false },
      (error, data) => {
        if (error) {
          return next(error);
        }

        res.status(200).json({
          success: true,
          data: `${eventId} archive.`,
        });
      }
    );

    await Log.create({
      operator: req.user.firstname,
      event: "Archived event",
      name: selectedEvent.eventName,
      id: eventId,
      time: new Date().getTime(),
    });
  } catch (error) {
    next(error);
  }
};
