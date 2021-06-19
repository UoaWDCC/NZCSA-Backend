const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const cryto = require('crypto');
// const jwt = require('jsonwebtoken');

const EventSchema = new mongoose.Schema({

  active: {
    type: Boolean,
    default: true,
  },

  eventName: {
    type: String,
    trim: true,
    required: 'Event name cannot be blank',
  },

  eventLocation: {
    type: String,
    trim: true,
    default: 'TBA',
  },

  eventDescription: {
    type: String,
    trim: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
  },

});

EventSchema.pre('save', async (next) => {
  next();
});

const Events = mongoose.model('Events', EventSchema);

module.exports = Events;