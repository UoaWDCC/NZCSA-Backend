const mongoose = require('mongoose');

const RSVPSchema = new mongoose.Schema({

  eventID: {
    type: String,
    trim: true,
  },

  userList: [
    {
      _id: false,
      userId: {
        type: String,
        unique: true,
      },
      isPaid: {
        type: Boolean,
        defualt: false,
      },
    },
  ],

});

RSVPSchema.pre('save', async (next) => {
  next();
});

const RSVPs = mongoose.model('RSVPs', RSVPSchema);

module.exports = RSVPs;
