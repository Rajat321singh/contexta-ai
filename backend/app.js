import dotenv from 'dotenv';

// Load environment variables FIRST before other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDatabase } from './src/config/database.js';
import { startSchedulers } from './src/scheduler/mainScheduler.js';

// Routes
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import feedbackRoutes from './src/routes/feedbackRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import triggerRoutes from './src/routes/triggerRoutes.js';
import debugRoutes from './src/routes/debugRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
console.log('📍 Registering API routes...');
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trigger', triggerRoutes);
app.use('/api/debug', debugRoutes);
console.log('✅ All routes registered');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'DevSignal AI API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start schedulers (only in production or if explicitly enabled)
    if (process.env.ENABLE_SCHEDULERS === 'true') {
      startSchedulers();
    } else {
      console.log(' Schedulers disabled. Set ENABLE_SCHEDULERS=true to enable');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n Contexta Backend running on port ${PORT}`);
      console.log(` API URL: http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/health\n`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();