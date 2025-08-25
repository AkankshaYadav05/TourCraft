const mongoose = require('mongoose');

const tourStepSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  screenshot: {
    type: String, // File path or URL
    required: false
  },
  annotations: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    text: String,
    type: {
      type: String,
      enum: ['highlight', 'arrow', 'text'],
      default: 'highlight'
    }
  }],
  order: {
    type: Number,
    required: true
  }
});

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  steps: [tourStepSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique share URL before saving
tourSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareUrl) {
    this.shareUrl = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Tour', tourSchema);