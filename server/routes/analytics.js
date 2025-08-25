const express = require('express');
const Tour = require('../models/Tour');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get analytics for user's tours
router.get('/', requireAuth, async (req, res) => {
  try {
    const tours = await Tour.find({ creator: req.session.userId });
    
    const totalTours = tours.length;
    const totalViews = tours.reduce((sum, tour) => sum + tour.views, 0);
    const totalClicks = tours.reduce((sum, tour) => sum + tour.clicks, 0);
    const publicTours = tours.filter(tour => tour.isPublic).length;
    
    // Mock engagement data for demonstration
    const engagementData = [
      { date: '2024-01-01', views: Math.floor(Math.random() * 100), clicks: Math.floor(Math.random() * 50) },
      { date: '2024-01-02', views: Math.floor(Math.random() * 100), clicks: Math.floor(Math.random() * 50) },
      { date: '2024-01-03', views: Math.floor(Math.random() * 100), clicks: Math.floor(Math.random() * 50) },
      { date: '2024-01-04', views: Math.floor(Math.random() * 100), clicks: Math.floor(Math.random() * 50) },
      { date: '2024-01-05', views: Math.floor(Math.random() * 100), clicks: Math.floor(Math.random() * 50) },
      { date: '2024-01-06', views: Math.floor(Math.random() * 100), clicks: Math.floor(Math.random() * 50) },
      { date: '2024-01-07', views: Math.floor(Math.random() * 100), clicks: Math.floor(Math.random() * 50) }
    ];
    
    const topTours = tours
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(tour => ({
        id: tour._id,
        title: tour.title,
        views: tour.views,
        clicks: tour.clicks,
        isPublic: tour.isPublic
      }));
    
    res.json({
      overview: {
        totalTours,
        totalViews,
        totalClicks,
        publicTours
      },
      engagementData,
      topTours
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;