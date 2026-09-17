import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import membershipRoutes from './routes/membershipRoutes.js';
import { paymentRoutes } from './routes/paymentRoutes.js';
import { drawRoutes } from './routes/drawRoutes.js';
import { charityRoutes } from './routes/charityRoutes.js';
import { scoreRoutes } from './routes/scoreRoutes.js';
import { donationRoutes } from './routes/donationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isConnectedToMongoDB } from './config/db.js';

dotenv.config();

export const app = express();

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5174';

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow clientOrigin and localhost variations
      if (
        origin === clientOrigin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'digital-heroes-backend',
    database: isConnectedToMongoDB ? 'connected (Atlas)' : 'disconnected (set MONGODB_URI)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/draw', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// Global Error Handler
app.use(errorHandler);
