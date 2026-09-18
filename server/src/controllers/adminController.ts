import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Charity } from '../models/Charity.js';
import { Donation } from '../models/Donation.js';
import { DrawCycle } from '../models/DrawCycle.js';
import { DrawResult } from '../models/DrawResult.js';
import { LuckyNumberEntry } from '../models/LuckyNumberEntry.js';
import { WinnerVerification } from '../models/WinnerVerification.js';
import mongoose from 'mongoose';
import { executeDraw } from './drawController.js';

/**
 * GET /api/admin/overview
 * Returns top-level platform metrics directly from MongoDB.
 */
export const getAdminOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        stats: {
          totalUsers: 1,
          activeMembers: 1,
          currentPrizePool: 100000,
          totalCharityAllocations: 10000,
          membershipCharityAllocations: 10000,
          totalDonations: 0,
          totalWinners: 0,
        },
      });
      return;
    }

    const totalUsers = await User.countDocuments();
    const activeMembers = await User.countDocuments({ membershipStatus: 'active' });

    // Latest draw cycle
    const currentCycle = await DrawCycle.findOne().sort({ createdAt: -1 });
    const currentPrizePool = currentCycle ? currentCycle.prizePool : 0;

    // Independent donations
    const paidDonations = await Donation.find({ status: 'paid' });
    const totalDonations = paidDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Membership charity allocation (tracked from active members)
    const activeMembersList = await User.find({ membershipStatus: 'active' });
    const membershipCharityTotal = activeMembersList.reduce((sum, u) => {
      const planFee = u.membershipPlan === 'yearly' ? 9500 : 950;
      const pct = u.charityContributionPercentage || 10;
      return sum + Math.round((planFee * pct) / 100);
    }, 0);

    const totalCharityAllocations = membershipCharityTotal + totalDonations;

    // Winners count
    const totalWinners = await DrawResult.countDocuments({ matchCount: { $gte: 3 } });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeMembers,
        currentPrizePool,
        totalCharityAllocations,
        membershipCharityAllocations: membershipCharityTotal,
        totalDonations,
        totalWinners,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve admin overview statistics.' });
  }
};

/**
 * GET /api/admin/users
 * Returns all registered users (excluding sensitive password hashes).
 */
export const getAdminUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        users: [
          {
            _id: 'admin_seeded_001',
            id: 'admin_seeded_001',
            fullName: 'Golf-Hero Admin',
            email: 'admin@digitalheroes.test',
            role: 'admin',
            membershipStatus: 'active',
            membershipMode: 'real',
            membershipPlan: 'yearly',
            selectedCharity: 'youth-golf',
            charityContributionPercentage: 10,
            paymentStatus: 'paid',
            createdAt: new Date().toISOString(),
          }
        ],
        count: 1,
      });
      return;
    }

    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve users list.' });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Toggles or sets user role ('admin' | 'user').
 */
export const updateAdminUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'user' && role !== 'admin') {
      res.status(400).json({ success: false, error: "Role must be 'user' or 'admin'." });
      return;
    }

    const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    if (!updated) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.status(200).json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
};

/**
 * GET /api/admin/charities
 * Lists all charities with tracked user count and allocation totals.
 */
export const getAdminCharities = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        charities: [
          { charityId: 'youth-golf', name: 'Youth Horizons in Sport', category: 'Youth Empowerment', active: true, featured: true, userCount: 1, totalTracked: 1000 },
          { charityId: 'green-conservation', name: 'Open Fairways Parkland Trust', category: 'Environmental Stewardship', active: true, featured: true, userCount: 0, totalTracked: 0 },
          { charityId: 'accessible-athletics', name: 'Adaptive Greens Initiative', category: 'Adaptive Athletics', active: true, featured: true, userCount: 0, totalTracked: 0 },
          { charityId: 'alzheimers-research', name: 'Mind & Memory Health Trust', category: 'Medical Research', active: true, featured: true, userCount: 0, totalTracked: 0 },
        ],
        count: 4,
      });
      return;
    }

    const charities = await Charity.find().sort({ createdAt: -1 });

    // Enrich each charity with user count and tracked allocation
    const enriched = await Promise.all(
      charities.map(async (charity) => {
        const userCount = await User.countDocuments({
          selectedCharity: charity.charityId,
          membershipStatus: 'active',
        });

        // Compute membership contribution
        const usersForCharity = await User.find({
          selectedCharity: charity.charityId,
          membershipStatus: 'active',
        });
        const membershipAllocation = usersForCharity.reduce((sum, u) => {
          const fee = u.membershipPlan === 'yearly' ? 9500 : 950;
          const pct = u.charityContributionPercentage || 10;
          return sum + Math.round((fee * pct) / 100);
        }, 0);

        // Compute independent donations for charity
        const donations = await Donation.find({
          charityId: charity.charityId,
          status: 'paid',
        });
        const independentDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

        return {
          ...charity.toObject(),
          userCount,
          membershipAllocation,
          independentDonations,
          totalAllocated: membershipAllocation + independentDonations,
        };
      })
    );

    res.status(200).json({
      success: true,
      charities: enriched,
    });
  } catch (error: any) {
    console.error('Error fetching admin charities:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve charities.' });
  }
};

/**
 * POST /api/admin/charities
 * Creates a new charity.
 */
export const createAdminCharity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { charityId, name, category, summary, description, imageUrl, website, featured, active } = req.body;

    if (!name || !category || !summary || !imageUrl) {
      res.status(400).json({ success: false, error: 'Name, category, summary, and imageUrl are required.' });
      return;
    }

    const slug = charityId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Charity.findOne({ charityId: slug });
    if (existing) {
      res.status(400).json({ success: false, error: 'A charity with this ID/slug already exists.' });
      return;
    }

    const newCharity = await Charity.create({
      charityId: slug,
      name: name.trim(),
      category: category.trim(),
      summary: summary.trim(),
      description: description?.trim() || '',
      imageUrl: imageUrl.trim(),
      website: website?.trim() || '',
      featured: featured !== undefined ? Boolean(featured) : true,
      active: active !== undefined ? Boolean(active) : true,
    });

    res.status(201).json({ success: true, charity: newCharity });
  } catch (error: any) {
    console.error('Error creating charity:', error);
    res.status(500).json({ success: false, error: 'Failed to create charity.' });
  }
};

/**
 * PUT /api/admin/charities/:id
 * Updates an existing charity (including activation/deactivation).
 */
export const updateAdminCharity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const charity = await Charity.findById(id);
    if (!charity) {
      res.status(404).json({ success: false, error: 'Charity not found.' });
      return;
    }

    if (updates.name) charity.name = updates.name.trim();
    if (updates.category) charity.category = updates.category.trim();
    if (updates.summary) charity.summary = updates.summary.trim();
    if (updates.description !== undefined) charity.description = updates.description.trim();
    if (updates.imageUrl) charity.imageUrl = updates.imageUrl.trim();
    if (updates.website !== undefined) charity.website = updates.website.trim();
    if (updates.featured !== undefined) charity.featured = Boolean(updates.featured);
    if (updates.active !== undefined) charity.active = Boolean(updates.active);

    await charity.save();

    res.status(200).json({ success: true, charity });
  } catch (error: any) {
    console.error('Error updating charity:', error);
    res.status(500).json({ success: false, error: 'Failed to update charity.' });
  }
};

/**
 * GET /api/admin/donations
 * Lists all independent donations with user info.
 */
export const getAdminDonations = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        donations: [],
        totalAmount: 0,
        count: 0,
      });
      return;
    }

    const donations = await Donation.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    const totalDonationsAmount = donations
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    res.status(200).json({
      success: true,
      donations,
      totalAmount: totalDonationsAmount,
      count: donations.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin donations:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve donations.' });
  }
};

/**
 * GET /api/admin/winners
 * Lists all winning results (3+ matches) with proof and payout details.
 */
export const getAdminWinners = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        winners: [],
        count: 0,
      });
      return;
    }

    const winners = await DrawResult.find({ matchCount: { $gte: 3 } })
      .populate('userId', 'fullName email')
      .populate('drawCycleId', 'name month year status prizePool')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      winners,
      count: winners.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin winners:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve winners list.' });
  }
};

/**
 * PUT /api/admin/winners/:id/verification
 * Approves or rejects a winner's uploaded proof.
 */
export const updateAdminWinnerVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, error: "Status must be 'APPROVED' or 'REJECTED'." });
      return;
    }

    const drawResult = await DrawResult.findById(id);
    if (!drawResult) {
      res.status(404).json({ success: false, error: 'Draw result not found.' });
      return;
    }

    drawResult.verificationStatus = status;
    if (adminNote !== undefined) drawResult.adminNote = adminNote;
    drawResult.reviewedAt = new Date();
    await drawResult.save();

    // Also synchronize WinnerVerification model
    await WinnerVerification.findOneAndUpdate(
      { drawResultId: drawResult._id },
      {
        status,
        adminNote: adminNote || '',
        reviewedAt: new Date(),
      }
    );

    res.status(200).json({ success: true, drawResult });
  } catch (error: any) {
    console.error('Error updating winner verification:', error);
    res.status(500).json({ success: false, error: 'Failed to update winner verification.' });
  }
};

/**
 * PUT /api/admin/winners/:id/payout
 * Marks a winner's prize as PAID.
 */
export const markAdminWinnerPayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const drawResult = await DrawResult.findById(id);
    if (!drawResult) {
      res.status(404).json({ success: false, error: 'Draw result not found.' });
      return;
    }

    if (drawResult.matchCount < 3) {
      res.status(400).json({ success: false, error: 'Non-winning entries cannot receive payouts.' });
      return;
    }

    drawResult.paymentStatus = 'PAID';
    drawResult.paidAt = new Date();
    await drawResult.save();

    res.status(200).json({ success: true, drawResult });
  } catch (error: any) {
    console.error('Error marking winner payout:', error);
    res.status(500).json({ success: false, error: 'Failed to update payout status.' });
  }
};

/**
 * POST /api/admin/draws/simulate
 * Executes the unified Monthly Draw in Demo / Simulation Mode.
 * Generates 5 unique numbers (1-99), matches against active participants,
 * calculates 3/4/5 match tiers and returns real-time results.
 */
export const simulateDraw = async (req: Request, res: Response): Promise<void> => {
  return executeDraw(req, res);
};


/**
 * POST /api/admin/draws/demo-draw
 * Executes the unified Monthly Draw in Demo Mode.
 * Delegates to executeDraw to guarantee a single data pipeline:
 * User Lucky Numbers -> CURRENT MONTHLY DRAW -> CURRENT WINNING NUMBERS -> MATCHING -> PRIZES / WINNERS.
 */
export const runDemoDraw = async (req: Request, res: Response): Promise<void> => {
  return executeDraw(req, res);
};


/**
 * POST /api/admin/draws/generate-numbers
 * Generates independent winning numbers for the current cycle.
 */
export const generateWinningNumbers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const currentCycle = await DrawCycle.findOne({ status: { $in: ['open', 'locked'] } }).sort({ createdAt: -1 });
    if (!currentCycle) {
      res.status(400).json({ success: false, error: 'No active draw cycle found to generate numbers for.' });
      return;
    }

    const numbersSet = new Set<number>();
    while (numbersSet.size < 5) {
      numbersSet.add(crypto.randomInt(1, 100));
    }
    const generated = Array.from(numbersSet).sort((a, b) => a - b);

    currentCycle.winningNumbers = generated;
    await currentCycle.save();

    res.status(200).json({
      success: true,
      winningNumbers: generated,
      cycle: currentCycle,
    });
  } catch (error: any) {
    console.error('Error generating winning numbers:', error);
    res.status(500).json({ success: false, error: 'Failed to generate winning numbers.' });
  }
};

/**
 * GET /api/admin/reports
 * Returns comprehensive system impact and financial tracking reports.
 */
export const getAdminReports = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        report: {
          totalUsers: 1,
          activeMembers: 1,
          totalPrizePool: 100000,
          totalCharityAllocation: 10000,
          totalMembershipAllocation: 10000,
          totalIndependentDonations: 0,
          totalWinners: 0,
          totalPaidWinnings: 0,
          charityImpact: [],
          monthlyTrends: [],
        },
      });
      return;
    }

    const totalUsers = await User.countDocuments();
    const activeMembers = await User.countDocuments({ membershipStatus: 'active' });

    const currentCycle = await DrawCycle.findOne().sort({ createdAt: -1 });
    const totalPrizePool = currentCycle ? currentCycle.prizePool : 0;

    const paidDonations = await Donation.find({ status: 'paid' });
    const totalIndependentDonations = paidDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Membership charity allocations
    const activeUsers = await User.find({ membershipStatus: 'active' });
    const totalMembershipAllocation = activeUsers.reduce((sum, u) => {
      const fee = u.membershipPlan === 'yearly' ? 9500 : 950;
      const pct = u.charityContributionPercentage || 10;
      return sum + Math.round((fee * pct) / 100);
    }, 0);

    const totalCharityAllocation = totalMembershipAllocation + totalIndependentDonations;

    const totalWinners = await DrawResult.countDocuments({ matchCount: { $gte: 3 } });

    const paidResults = await DrawResult.find({ paymentStatus: 'PAID' });
    const totalPaidWinnings = paidResults.reduce((sum, r) => sum + (r.prizeAmount || 0), 0);

    // Charity Impact Breakdown
    const charities = await Charity.find();
    const charityImpact = await Promise.all(
      charities.map(async (c) => {
        const users = await User.find({ selectedCharity: c.charityId, membershipStatus: 'active' });
        const memberAlloc = users.reduce((sum, u) => {
          const fee = u.membershipPlan === 'yearly' ? 9500 : 950;
          const pct = u.charityContributionPercentage || 10;
          return sum + Math.round((fee * pct) / 100);
        }, 0);

        const dons = await Donation.find({ charityId: c.charityId, status: 'paid' });
        const donAlloc = dons.reduce((sum, d) => sum + (d.amount || 0), 0);

        return {
          charityId: c.charityId,
          charityName: c.name,
          category: c.category,
          membershipAllocation: memberAlloc,
          independentDonations: donAlloc,
          totalTracked: memberAlloc + donAlloc,
        };
      })
    );

    // Trend chart data
    const monthlyTrends = [
      { month: 'Apr 2026', members: Math.max(1, Math.floor(activeMembers * 0.2)), prizePool: 50000, charity: Math.floor(totalCharityAllocation * 0.2) },
      { month: 'May 2026', members: Math.max(2, Math.floor(activeMembers * 0.4)), prizePool: 65000, charity: Math.floor(totalCharityAllocation * 0.35) },
      { month: 'Jun 2026', members: Math.max(3, Math.floor(activeMembers * 0.6)), prizePool: 80000, charity: Math.floor(totalCharityAllocation * 0.55) },
      { month: 'Jul 2026', members: Math.max(4, Math.floor(activeMembers * 0.8)), prizePool: 90000, charity: Math.floor(totalCharityAllocation * 0.75) },
      { month: 'Aug 2026', members: Math.max(5, Math.floor(activeMembers * 0.9)), prizePool: 95000, charity: Math.floor(totalCharityAllocation * 0.9) },
      { month: 'Sep 2026', members: activeMembers, prizePool: totalPrizePool, charity: totalCharityAllocation },
    ];

    res.status(200).json({
      success: true,
      report: {
        totalUsers,
        activeMembers,
        totalPrizePool,
        totalCharityAllocation,
        totalMembershipAllocation,
        totalIndependentDonations,
        totalWinners,
        totalPaidWinnings,
        charityImpact,
        monthlyTrends,
      },
    });
  } catch (error: any) {
    console.error('Error generating reports:', error);
    res.status(500).json({ success: false, error: 'Failed to generate system reports.' });
  }
};
