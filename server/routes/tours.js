const express = require('express');
const multer = require('multer');
const path = require('path');
const Tour = require('../models/Tour');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get all tours for authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const tours = await Tour.find({ creator: req.session.userId })
      .sort({ updatedAt: -1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single tour
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const tour = await Tour.findOne({
      _id: req.params.id,
      creator: req.session.userId
    });
    
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get public tour by share URL
router.get('/public/:shareUrl', async (req, res) => {
  try {
    const tour = await Tour.findOne({
      shareUrl: req.params.shareUrl,
      isPublic: true
    }).populate('creator', 'username');
    
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Increment view count
    tour.views += 1;
    await tour.save();
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new tour
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, steps = [] } = req.body;
    
    const tour = new Tour({
      title,
      description,
      creator: req.session.userId,
      steps
    });
    
    await tour.save();
    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tour
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const tour = await Tour.findOne({
      _id: req.params.id,
      creator: req.session.userId
    });
    
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    Object.assign(tour, req.body);
    await tour.save();
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tour
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const tour = await Tour.findOneAndDelete({
      _id: req.params.id,
      creator: req.session.userId
    });
    
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload screenshot
router.post('/upload', requireAuth, upload.single('screenshot'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle tour visibility
router.patch('/:id/visibility', requireAuth, async (req, res) => {
  try {
    const tour = await Tour.findOne({
      _id: req.params.id,
      creator: req.session.userId
    });
    
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    tour.isPublic = !tour.isPublic;
    await tour.save();
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment click count
router.post('/:shareUrl/click', async (req, res) => {
  try {
    const tour = await Tour.findOne({ shareUrl: req.params.shareUrl });
    if (tour) {
      tour.clicks += 1;
      await tour.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;