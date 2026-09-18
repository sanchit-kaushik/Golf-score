import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { seedAdminAccount } from '../utils/seedData.js';
import { seedAdminInMemory } from '../utils/userStore.js';
import mongoose from 'mongoose';

async function main() {
  console.log('🌱 [seedAdmin] Starting admin seeding script...');

  // Always seed in memory
  await seedAdminInMemory();

  // Connect to MongoDB Atlas if URI available
  const connected = await connectDB();
  if (connected) {
    const result = await seedAdminAccount();
    console.log(`✅ [seedAdmin] MongoDB Atlas: ${result.message}`);
  } else {
    console.log('⚠️ [seedAdmin] MongoDB Atlas connection not established; in-memory admin was prepared.');
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  console.log('🎉 [seedAdmin] Admin account ready:');
  console.log('   Email:    admin@digitalheroes.test');
  console.log('   Password: Admin@12345');
  console.log('   Role:     admin');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ [seedAdmin] Fatal error:', err);
  process.exit(1);
});
