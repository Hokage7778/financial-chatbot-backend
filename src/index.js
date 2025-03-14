const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();
console.log('Environment loaded. PORT =', process.env.PORT);

// Routes
const financialRoutes = require('./routes/financial');
const psychometricRoutes = require('./routes/psychometric');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5002;
console.log('Using PORT:', PORT);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
})); // Less restrictive security headers
app.use(morgan('dev')); // Logging

// Configure CORS to explicitly allow requests from the frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || [
    'http://localhost:5173',
    'https://financial-chatbot-app.netlify.app',
    'https://cosmic-hummingbird-6314a4.netlify.app', // Add your actual Netlify domain
    /\.netlify\.app$/, // Allow all Netlify subdomains
    /\.netlify\.live$/ // Allow Netlify Live domains for previews
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json()); // JSON body parsing

// Basic health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.status(200).json({ message: 'Server is working!' });
});

// Handle invalid JSON in request body
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

// API Routes
app.use('/api/financial', financialRoutes);
app.use('/api/psychometric', psychometricRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log('404 Not Found:', req.originalUrl);
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.stack) console.error('Stack:', err.stack);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: statusCode === 404 ? 'Resource not found' : 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Process error handling to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  // Log error but don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Log error but don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Start server
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`Test endpoint available at http://localhost:${PORT}/test`);
  });
  
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please use a different port.`);
    } else {
      console.error('Server error:', error.message);
    }
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  console.error('Stack:', error.stack);
}

module.exports = app; 