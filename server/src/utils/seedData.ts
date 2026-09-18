import mongoose from 'mongoose';
import { Charity } from '../models/Charity.js';
import { DrawCycle } from '../models/DrawCycle.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

export const seedInitialData = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('ℹ️ [Seeder] MongoDB Atlas not connected; skipping initial data seeding.');
      return;
    }

    // 1. Seed Initial Charities if empty
    const charityCount = await Charity.countDocuments();
    if (charityCount === 0) {
      console.log('🌱 [Seeder] Seeding initial charities into MongoDB Atlas...');
      await Charity.create([
        {
          charityId: 'youth-golf',
          name: 'Youth Horizons in Sport',
          category: 'Youth Empowerment',
          summary:
            'Providing equipment, coaching, and educational mentorship to underprivileged youth through the discipline of golf.',
          description:
            'A national athletic outreach charity supporting thousands of junior players with equipment, certified golf instruction, and academic tutoring.',
          imageUrl:
            'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=900&q=80',
          website: 'https://youthhorizons.org',
          featured: true,
          active: true,
        },
        {
          charityId: 'green-conservation',
          name: 'Open Fairways Parkland Trust',
          category: 'Environmental Stewardship',
          summary:
            'Preserving local biodiversity, native woodlands, and freshwater wetlands situated around historic golf corridors.',
          description:
            'Dedicated to natural terrain rehabilitation, eco-friendly turf research, and establishing ecological buffer corridors.',
          imageUrl:
            'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=80',
          website: 'https://openfairwaystrust.org',
          featured: true,
          active: true,
        },
        {
          charityId: 'accessible-athletics',
          name: 'Adaptive Greens Initiative',
          category: 'Adaptive Athletics',
          summary:
            'Creating custom adaptive mobility carts and specialized coaching clinics for injured veterans and athletes with disabilities.',
          description:
            'Providing specialized adaptive paragolfer carts, accessibility gear, and trauma recovery programs.',
          imageUrl:
            'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=900&q=80',
          website: 'https://adaptivegreens.org',
          featured: true,
          active: true,
        },
        {
          charityId: 'alzheimers-research',
          name: 'Mind & Memory Health Trust',
          category: 'Medical Research',
          summary:
            'Advancing breakthrough clinical research and community care for dementia and neurodegenerative memory wellness.',
          description:
            'Funding vital diagnostic trials, patient-family support programs, and community memory initiatives.',
          imageUrl:
            'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=900&q=80',
          website: 'https://mindmemoryhealth.org',
          featured: true,
          active: true,
        },
      ]);
      console.log('✅ [Seeder] Seeded 4 partner charities.');
    }

    // 2. Seed Current Monthly Draw Cycle if none exists
    const currentMonth = 'September';
    const currentYear = 2026;
    const existingCycle = await DrawCycle.findOne({ month: currentMonth, year: currentYear });

    if (!existingCycle) {
      console.log('🌱 [Seeder] Seeding September 2026 Draw Cycle into MongoDB Atlas...');
      const lockDate = new Date('2026-09-28T23:59:59.000Z');
      await DrawCycle.create({
        name: 'September 2026 Monthly Draw',
        month: currentMonth,
        year: currentYear,
        status: 'open',
        drawMethod: 'random',
        winningNumbers: [7, 31, 46, 72, 88], // Pre-configured independent winning numbers preview
        prizePool: 100000,
        jackpotRollover: true,
        jackpotAmount: 40000,
        lockDate,
        publishedAt: new Date('2026-09-01T00:00:00.000Z'),
      });
      console.log('✅ [Seeder] Seeded September 2026 Draw Cycle.');
    }

    // 3. Seed Seeded Admin Test Account
    await seedAdminAccount();
  } catch (err: any) {
    console.error('⚠️ [Seeder] Error checking or seeding initial data:', err?.message || err);
  }
};

/**
 * Idempotent Admin Account Seeder
 * Ensures exactly one admin test account exists with email 'admin@digitalheroes.test'
 * and password 'Admin@12345'. Safely hashes password via bcrypt.
 */
export const seedAdminAccount = async (): Promise<{ success: boolean; message: string; action: string }> => {
  const adminEmail = 'admin@digitalheroes.test';
  const plainPassword = 'Admin@12345';

  if (mongoose.connection.readyState !== 1) {
    console.log(`ℹ️ [Seeder] MongoDB Atlas not connected; in-memory fallback admin active for ${adminEmail}.`);
    return {
      success: true,
      message: `MongoDB Atlas not connected; in-memory fallback admin active for ${adminEmail}`,
      action: 'in_memory',
    };
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(plainPassword, salt);

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    console.log(`🌱 [Seeder] Creating admin test account (${adminEmail})...`);
    await User.create({
      fullName: 'Golf-Hero Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      membershipStatus: 'active',
      membershipMode: 'real',
      membershipPlan: 'yearly',
      paymentStatus: 'paid',
      charityContributionPercentage: 10,
      selectedCharity: 'youth-golf',
    });
    console.log(`✅ [Seeder] Admin test account created successfully.`);
    return { success: true, message: `Admin test account created (${adminEmail})`, action: 'created' };
  }

  // Admin exists -> verify password hash and role
  let needsSave = false;
  const isPasswordMatch = await bcrypt.compare(plainPassword, existingAdmin.passwordHash || '');

  if (!isPasswordMatch) {
    console.log(`🔄 [Seeder] Updating password hash for ${adminEmail} to match Admin@12345...`);
    existingAdmin.passwordHash = passwordHash;
    needsSave = true;
  }

  if (existingAdmin.role !== 'admin') {
    console.log(`🔄 [Seeder] Promoting ${adminEmail} to role="admin"...`);
    existingAdmin.role = 'admin';
    needsSave = true;
  }

  if (existingAdmin.membershipStatus !== 'active') {
    existingAdmin.membershipStatus = 'active';
    existingAdmin.membershipMode = 'real';
    existingAdmin.paymentStatus = 'paid';
    needsSave = true;
  }

  if (existingAdmin.fullName !== 'Golf-Hero Admin') {
    existingAdmin.fullName = 'Golf-Hero Admin';
    needsSave = true;
  }

  if (needsSave) {
    await existingAdmin.save();
    console.log(`✅ [Seeder] Admin test account updated and verified with role=admin.`);
    return { success: true, message: `Admin test account updated (${adminEmail})`, action: 'updated' };
  }

  console.log(`✅ [Seeder] Admin test account is verified and ready (${adminEmail}).`);
  return { success: true, message: `Admin test account already verified and active (${adminEmail})`, action: 'verified' };
};
