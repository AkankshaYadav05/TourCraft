const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB connection
mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



// Log connection status
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});


// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const analyticsRoutes = require('./routes/analytics');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/analytics', analyticsRoutes);


// const path = require('path');
// app.use(express.static(path.join(__dirname, '../client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});