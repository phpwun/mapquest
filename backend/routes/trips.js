const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('user', 'username favoriteColor favoriteAnimal')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'username favoriteColor favoriteAnimal')
      .populate('comments.user', 'username favoriteColor favoriteAnimal');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    res.json(trip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new trip
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received trip data:', JSON.stringify(req.body, null, 2));
    
    const { title, description, mainLocation, photos } = req.body;

    // Check if photos array has more than 20 items
    if (photos && photos.length > 20) {
      return res.status(400).json({ message: 'Trip cannot have more than 20 photos' });
    }

    // Fix image URLs if needed (replace minio:9000 with localhost:9000)
    let processedPhotos = photos || [];
    if (processedPhotos.length > 0) {
      processedPhotos = processedPhotos.map(photo => {
        if (photo.url && photo.url.includes('minio:9000')) {
          photo.url = photo.url.replace('minio:9000', 'localhost:9000');
        }
        return photo;
      });
    }

    const newTrip = new Trip({
      title,
      description,
      user: req.user.id,
      mainLocation,
      photos: processedPhotos
    });

    console.log('Saving trip to database:', JSON.stringify(newTrip, null, 2));
    const trip = await newTrip.save();

    // Populate user fields for response
    await trip.populate('user', 'username favoriteColor favoriteAnimal');

    console.log('Trip saved successfully:', trip._id);
    res.status(201).json(trip);
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Update a trip
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, mainLocation, photos } = req.body;

    // Check if photos array has more than 20 items
    if (photos && photos.length > 20) {
      return res.status(400).json({ message: 'Trip cannot have more than 20 photos' });
    }

    // Find trip
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Fix image URLs if needed (replace minio:9000 with localhost:9000)
    let processedPhotos = photos || [];
    if (processedPhotos.length > 0) {
      processedPhotos = processedPhotos.map(photo => {
        if (photo.url && photo.url.includes('minio:9000')) {
          photo.url = photo.url.replace('minio:9000', 'localhost:9000');
        }
        return photo;
      });
    }

    // Update trip
    if (title) trip.title = title;
    if (description) trip.description = description;
    if (mainLocation) trip.mainLocation = mainLocation;
    if (photos) trip.photos = processedPhotos;

    await trip.save();

    // Populate user fields for response
    await trip.populate('user', 'username favoriteColor favoriteAnimal');

    res.json(trip);
  } catch (err) {
    console.error('Error updating trip:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Delete a trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await trip.remove();

    res.json({ message: 'Trip removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a trip
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if comment is emoji or text
    const isEmoji = text.length <= 12;

    const newComment = {
      text,
      user: req.user.id,
      isEmoji
    };

    trip.comments.unshift(newComment);

    await trip.save();

    // Populate user fields for response
    await trip.populate('comments.user', 'username favoriteColor favoriteAnimal');

    res.json(trip.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment
router.delete('/:id/comments/:comment_id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Pull out comment
    const comment = trip.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check user is comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Get remove index
    const removeIndex = trip.comments
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    trip.comments.splice(removeIndex, 1);

    await trip.save();

    res.json(trip.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;