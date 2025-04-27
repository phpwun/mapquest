const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  address: {
    type: String
  }
});

const PhotoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  location: {
    type: LocationSchema,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  isEmoji: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mainLocation: {
    type: LocationSchema,
    required: true
  },
  photos: [PhotoSchema],
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure no more than 20 photos per trip
TripSchema.path('photos').validate(function(photos) {
  return photos.length <= 20;
}, 'Trip cannot have more than 20 photos');

module.exports = mongoose.model('Trip', TripSchema);