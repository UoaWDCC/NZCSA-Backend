const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cryto = require('crypto');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
<<<<<<< HEAD

  isAdmin: {
		type: Boolean,
		default: false
    
	},

  firstname: {
    type: String,
    maxlength: 20,
    required: [true, 'Please provide your firstname'],
  },
  lastname: {
    type: String,
    maxlength: 20,
    required: [true, 'Please provide your lastname'],
  },
=======
  firstname: {
    type: String,
    maxlength: 20,
    required: [true, 'Please provide your firstname'],
  },
  lastname: {
    type: String,
    maxlength: 20,
    required: [true, 'Please provide your lastname'],
  },
>>>>>>> master

  email: {
    type: String,
    required: [true, 'Please provide a email'],
    unique: true,
    match: [
      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    match:[
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'Please provide a valid password with at least 8 characters include upper and lower letter, and number'
    ],
    select: false,
  },
  gender:{
    type: String,
<<<<<<< HEAD
    enum: ["F", "M"],
=======
>>>>>>> master
    maxlength: 1,
  },
  university:{
    type: String,
  },
  major:{
    type: String,
  },
  year:{
    type: String,
  },
  faculty:{
    type: String,
  },
  dateofbirth:{
<<<<<<< HEAD
    type: Date,
=======
    type: String,
>>>>>>> master
  },
  wechatid:{
    type: String,
  },


  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = cryto.randomBytes(20).toString('hex');
  console.log('Before:', resetToken);
  this.resetPasswordToken = cryto.createHash('sha256').update(resetToken).digest('hex');
  console.log('After: ', this.resetPasswordToken);

  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

  return resetToken;
};

// Creating MongoDB model (Relation schema('User') in MongoDB atlas)
const User = mongoose.model('User', UserSchema);

module.exports = User;
