const User = require("../models/User");
const Event = require("../models/Events");
const ErrorResponse = require("../utils/errorResponse");

exports.shwoEventUserInfo = async (req, res, next) => {
  const { eventId } = req.body;
  let userInfo = [];
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return next(new ErrorResponse("Event not found", 401));
    }
    // event.userList.forEach(async (userId) => {
    //   const user = await User.findOne({ _id: userId });
    //   userInfo.push(user);
    // });
    for (let i = 0; i < event.userList.length; i++) {
      const user = await User.findOne({ _id: event.userList[i] });
      userInfo.push(user);
    }
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

exports.promoToMember = async (req, res, next) => {
  const { userId } = req.body;

  try {
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

    await User.findByIdAndRemove(userId, (error, data) => {
      if (error) {
        return next(error);
      }
      res.status(200).json({
        success: true,
        data: `${userId} Deleted.`,
      });
    });
  } catch (e) {
    next(e);
  }
};
