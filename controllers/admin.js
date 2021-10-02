const User = require("../models/User");
const Event = require("../models/Events");
const ErrorResponse = require("../utils/errorResponse");
const Log = require("../models/Logs");

async function findUsers(_id) {
  const user = await User.findOne({ _id });
  return user;
}

exports.showEventUserInfo = async (req, res, next) => {
  const { eventId } = req.params;
  const results = [];
  const userInfo = [];
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return next(new ErrorResponse("Event not found", 401));
    }
    for (let i = 0; i < event.userList.length; i += 1) {
      results.push(findUsers(event.userList[i]));
    }
    const userInfoPromise = await Promise.all(results);
    userInfoPromise.map((user) => (user != null ? userInfo.push(user) : ""));
    res.send(userInfo);
  } catch (e) {
    next(e);
  }
};

exports.showMemberList = async (req, res, next) => {
  try {
    await User.find({}, (error, users) => {
      const userMap = [];
      users.forEach((user) => {
        userMap.push(user);
      });
      res.send(userMap);
    });
  } catch (e) {
    next(e);
  }
};

exports.showLogInfo = async (req, res, next) => {
  const { userId } = req.body;
  ////////////////////////////////////function need to collect log info
};

exports.promoToMember = async (req, res, next) => {
  const { userId } = req.body;
  
  try {
    const user = await User.findOne({ _id: userId });

    // res.status(200).json({
    //   operator: req.user.firstname,
    //   user: user.firstname,
    //   event: "promoted",
    //   time: getTime(),
    // });

    if (!user) {
      return next(new ErrorResponse("User not found", 400));
    }

    if (user.isMembership) {
      return next(new ErrorResponse("User is already a member", 400));
    }

    user.isMembership = true;

    await user.save();
    await Log.create({
      operator: req.user.firstname,
      event: "Promoted user",
      name : user.firstname,
      id : user._id,
      time: new Date().getTime(),
    });

    res.status(200).json({
      success: true,
      info: `${userId} has been promoted to membership`,
    });
  } catch (e) {
    next(e);
  }
};

exports.removeMembership = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const { isAdmin } = req.user;

    if (!isAdmin) {
      return next(new ErrorResponse("You are not admin", 401));
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new ErrorResponse("User not found", 400));
    }

    if (user.isMembership) {
      return next(new ErrorResponse("User is already a member", 400));
    }

    user.isMembership = true;

    await user.save();

    res.status(200).json({
      success: true,
      info: `${userId} has been promoted to membership`,
    });
  } catch (e) {
    next(e);
  }
};

exports.deleteMember = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new ErrorResponse("User not found", 400));
    }

    const removedName = user.firstname;
    const removedID = user._id;

    await User.findByIdAndRemove(userId, (error, data) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: `${userId} Deleted.`,
      });
    });

    await Log.create({
      operator: req.user.firstname,
      event: "Removed user",
      name: removedName,
      id: removedID,
      time: new Date().getTime(),
    });
  } catch (e) {
    next(e);
  }
};
