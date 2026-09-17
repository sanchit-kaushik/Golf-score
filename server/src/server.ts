import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './config/db.js';
import { seedInitialData } from './utils/seedData.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

const startServer = async () => {
  console.log('🚀 [Digital Heroes Backend] Initializing server...');

  // Connect to MongoDB Atlas
  const connected = await connectDB();
  if (connected) {
    await seedInitialData();
  }

  const server = app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`DIGITAL HEROES BACKEND API SERVER RUNNING`);
    console.log(`Port:        ${PORT}`);
    console.log(`URL:         http://localhost:${PORT}`);
    console.log(`Health:      http://localhost:${PORT}/api/health`);
    console.log(`Auth API:    http://localhost:${PORT}/api/auth`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================\n`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Digital Heroes Backend] Gracefully shutting down...');
    server.close(() => {
      console.log('[Digital Heroes Backend] Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((err) => {
  console.error('[Digital Heroes Backend] Fatal startup error:', err);
  process.exit(1);
});
