const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  address: {
    type: String
  }
});

const PhotoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
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
    maxlength: 500,
    trim: true
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
    required: true,
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
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

// Add validation for latitude and longitude ranges
TripSchema.path('mainLocation.lat').validate(function(lat) {
  return lat >= -90 && lat <= 90;
}, 'Latitude must be between -90 and 90 degrees');

TripSchema.path('mainLocation.lng').validate(function(lng) {
  return lng >= -180 && lng <= 180;
}, 'Longitude must be between -180 and 180 degrees');

module.exports = mongoose.model('Trip', TripSchema);