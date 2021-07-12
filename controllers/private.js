const User = require("../models/User");

exports.signUpMembership = async (req, res) => {
  const { gender, university, major, year, faculty, dateofbirth, wechatid } =
    req.body;

  try {
    const { user } = req;

    user.gender = gender;
    user.university = university;
    user.major = major;
    user.year = year;
    user.faculty = faculty;
    user.dateofbirth = dateofbirth;
    user.wechatid = wechatid;

    await user.save();

    res.status(200).json({
      success: true,
      info: "infomation completed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      info: error.message,
    });
  }
};

exports.getPrivateData = (req, res, next) => {
  const { username } = req.user;

  // const { user } = req;
  // user.isMembership = false;

  // user.save();

  res.status(200).json({
    success: true,
    data: req.user,
  });
};
