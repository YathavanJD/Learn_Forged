const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import modules from server subfolder
const connectDB = require('./server/src/config/database');
const authRoutes = require('./server/src/routes/authRoutes');
const courseRoutes = require('./server/src/routes/courseRoutes');
const quizRoutes = require('./server/src/routes/quizRoutes');
const discussionRoutes = require('./server/src/routes/discussionRoutes');
const notificationRoutes = require('./server/src/routes/notificationRoutes');
const paymentRoutes = require('./server/src/routes/paymentRoutes');
const { errorHandler } = require('./server/src/middleware/errorHandler');

const app = express();

// Connect to Database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'server', 'uploads')));
app.use(express.static(path.join(__dirname, 'server', 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'server', 'public', 'index.html'));
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});
