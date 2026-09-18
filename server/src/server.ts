import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './config/db.js';
import { seedInitialData } from './utils/seedData.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

const startServer = async () => {
  console.log('🚀 [Golf-Hero Backend] Initializing server...');

  // Connect to MongoDB Atlas
  const connected = await connectDB();
  if (connected) {
    await seedInitialData();
  }

  const server = app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`GOLF-HERO BACKEND API SERVER RUNNING`);
    console.log(`Port:        ${PORT}`);
    console.log(`URL:         http://localhost:${PORT}`);
    console.log(`Health:      http://localhost:${PORT}/api/health`);
    console.log(`Auth API:    http://localhost:${PORT}/api/auth`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================\n`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Golf-Hero Backend] Gracefully shutting down...');
    server.close(() => {
      console.log('[Golf-Hero Backend] Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((err) => {
  console.error('[Golf-Hero Backend] Fatal startup error:', err);
  process.exit(1);
});
