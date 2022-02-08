const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cryto = require("crypto");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  isAdmin: {
    type: Boolean,
    default: false,
  },

  isMembership: {
    type: Boolean,
    default: false,
  },

  firstname: {
    type: String,
    maxlength: 20,
    required: [true, "Please provide your firstname"],
  },
  lastname: {
    type: String,
    maxlength: 20,
    required: [true, "Please provide your lastname"],
  },

  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: true,
    match: [
      // eslint-disable-next-line no-useless-escape
      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 3,
    // match: [
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    //   'Please provide a valid password with at least 8 characters include upper and lower letter, and number',
    // ],
    select: false,
  },
  gender: {
    type: String,
  },
  university: {
    type: String,
  },
  stdentId: {
    type: String,
  },
  phone: {
    type: String,
  },
  faculty: {
    type: String,
  },
  dateofbirth: {
    type: Date,
  },
  wechatId: {
    type: String,
  },

  attendedEvents: [String],

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = cryto.randomBytes(20).toString("hex");
  console.log("Before:", resetToken);
  this.resetPasswordToken = cryto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log("After: ", this.resetPasswordToken);

  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

  return resetToken;
};

// Creating MongoDB model (Relation schema('User') in MongoDB atlas)
const User = mongoose.model("User", UserSchema);

module.exports = User;
