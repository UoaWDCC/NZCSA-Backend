const User = require("../models/User");

exports.signUpMembership = async (req, res) => {
  const {
    gender,
    university,
    selectedFaculty,
    dateofbirth,
    wechatid,
    phone,
    stdentId,
  } = req.body;

  // console.log(req.body)
  try {
    const { user } = req;

    user.gender = gender;
    user.university = university;
    user.faculty = selectedFaculty;
    user.dateofbirth = dateofbirth;
    user.wechatid = wechatid;
    user.phone = phone;
    user.stdentId = stdentId;

    await user.save();
    // console.log(1)
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

  // used for testing payment by removing membership from yourself
  // const { user } = req;
  // user.isMembership = false;

  // user.save();

  res.status(200).json({
    success: true,
    data: req.user,
  });
};
