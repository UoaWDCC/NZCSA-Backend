const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  const {
    firstname, lastname, email, password,
  } = req.body;

  try {
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
    });

    // eslint-disable-next-line no-use-before-define
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
      return next(new ErrorResponse('Email Address does not exist', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Wrong password', 401));
    }

    // eslint-disable-next-line no-use-before-define
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

    const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;

    const message = `<body style="background-color: #e9ecef;">
    <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
      A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
  
  
      <tr>
        <td align="center" bgcolor="#e9ecef">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
            <tr>
              <td align="center" valign="top" style="padding: 36px 24px;">
                <a href="https://sendgrid.com" target="_blank" style="display: inline-block;">
                  <img src="http://nzcsa.com/img/logo.png" alt="Logo" border="0" width="100%" style="display: block;">
                </a>
              </td>
            </tr>
          </table>
  
        </td>
      </tr>
  
      <tr>
        <td align="center" bgcolor="#e9ecef">
  
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
            <tr>
              <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Reset Your Password</h1>
              </td>
            </tr>
          </table>
  
        </td>
      </tr>
  
      <tr>
        <td align="center" bgcolor="#e9ecef">
  
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  
  
            <tr>
              <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                <p style="margin: 0;">Tap the button below to reset your customer account password. If you didn't request a new password, you can safely delete this email.</p>
              </td>
            </tr>
  
            <tr>
              <td align="left" bgcolor="#ffffff">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                      <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" bgcolor="#b51c07" style="border-radius: 6px;">
                            <a href="${resetURL}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Click me</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  
            <tr>
              <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                <p style="margin: 0;"><a href=${resetURL} clicktracking=off>${resetURL}</a></p>
              </td>
            </tr>
  
            <tr>
              <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                <p style="margin: 0;">Cheers,<br> NZCSA</p>
              </td>
            </tr>
  
  
          </table>
  
        </td>
      </tr>
  
    </table>
  
  </body>`;

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
  //   console.log('Before: ', req.params.resetToken);
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  //   console.log('After', resetPasswordToken);
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
    next(error);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  const { isAdmin } = user;
  res.status(statusCode).json({
    success: true,
    isAdmin,
    token,
  });
};
