const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      info: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // console.log("no user found");
      return next(new ErrorResponse('Email could not be sent', 404));
    }
    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetURL = `http://localhost:3000/passwordreset/${resetToken}`;

    const message = `
            <h1>You have requested a password reset</h1>
            <a href=${resetURL} clicktracking=off>${resetURL}</a>
        `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password reset request',
        text: message,
      });

      res.status(200).json({
        success: true,
        info: 'Email sent',
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExipre = undefined;

      await user.save();
      // console.log(error);
      return next(new ErrorResponse('Email could not be sent', 404));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetpassword = async (req, res, next) => {
  // console.log('Before: ', req.params.resetToken);
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  // console.log('After', resetPasswordToken);
  // console.log(Date.now());

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorResponse('Invaild Reset Token', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExipre = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      info: 'Password reset success',
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
  });
};
