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
import { isConnectedToMongoDB, ensureDbConnected } from './config/db.js';
import mongoose from 'mongoose';

dotenv.config();

export const app = express();

// CORS Configuration - Permissive for Vercel, localhost, and custom domains with credentials
app.use(
  cors({
    origin: true, // Dynamically reflects request origin and allows credentials
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
  })
);

app.use(express.json());
app.use(cookieParser());

// Connection gate: await in-flight connection before routing Mongoose requests
app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState === 2) {
    await ensureDbConnected().catch(() => {});
  }
  next();
});

// Health Check
app.get('/api/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1 || isConnectedToMongoDB;
  res.status(200).json({
    status: 'ok',
    service: 'golf-hero-backend',
    database: dbConnected ? 'connected (Atlas)' : 'fallback mode',
    readyState: mongoose.connection.readyState,
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
