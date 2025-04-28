const express = require('express');
const router = express.Router();
const Minio = require('minio');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Configure MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minio_access_key',
  secretKey: process.env.MINIO_SECRET_KEY || 'minio_secret_key'
});

// Verify MinIO connection
router.use(async (req, res, next) => {
  try {
    if (!req.path.includes('/upload')) {
      return next();
    }
    
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(
      process.env.MINIO_BUCKET_NAME || 'photos'
    );
    
    if (!bucketExists) {
      console.error('MinIO bucket does not exist');
      return res.status(500).json({ message: 'Storage configuration error' });
    }
    
    next();
  } catch (err) {
    console.error('MinIO connection error:', err);
    res.status(500).json({ message: 'Storage connection error' });
  }
});

// Upload a photo
router.post('/upload', auth, (req, res) => {
  // Debug auth info
  console.log('Auth header present:', !!req.header('x-auth-token'));
  console.log('User ID from token:', req.user?.id);
  
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Generate random filename to avoid collisions
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
      
      console.log('Uploading file to MinIO:', fileName);
      
      // Upload file to MinIO
      await minioClient.putObject(
        process.env.MINIO_BUCKET_NAME || 'photos',
        fileName,
        req.file.buffer,
        {
          'Content-Type': req.file.mimetype,
        }
      );

      // Generate URL
      const fileUrl = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${process.env.MINIO_BUCKET_NAME || 'photos'}/${fileName}`;

      console.log('File uploaded successfully:', fileUrl);
      
      res.status(201).json({
        message: 'Photo uploaded successfully',
        url: fileUrl,
        fileName
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      res.status(500).json({ message: 'Error uploading file: ' + err.message });
    }
  });
});

// Delete a photo
router.delete('/:fileName', auth, async (req, res) => {
  try {
    await minioClient.removeObject(
      process.env.MINIO_BUCKET_NAME || 'photos',
      req.params.fileName
    );

    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

module.exports = router;