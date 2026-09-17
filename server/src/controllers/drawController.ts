import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { DrawCycle, IDrawCycle } from '../models/DrawCycle.js';
import { LuckyNumberEntry } from '../models/LuckyNumberEntry.js';
import { DrawResult } from '../models/DrawResult.js';
import { WinnerVerification } from '../models/WinnerVerification.js';
import { userStore } from '../utils/userStore.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Helper: Generate 5 unique random integers between 1 and 99 using cryptographic RNG
export const generateIndependentWinningNumbers = (): number[] => {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    const rand = crypto.randomInt(1, 100); // 1 to 99 inclusive
    numbers.add(rand);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

// Helper: Get or initialize the active monthly cycle
export const getActiveDrawCycle = async (): Promise<IDrawCycle> => {
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  let cycle = await DrawCycle.findOne({
    $or: [
      { status: 'open' },
      { status: 'published' },
      { status: 'locked' },
      { month: currentMonth, year: currentYear }
    ]
  }).sort({ createdAt: -1 });

  if (!cycle) {
    const lockDate = new Date();
    lockDate.setDate(lockDate.getDate() + 12);

    cycle = await DrawCycle.create({
      name: `${currentMonth} ${currentYear} Monthly Draw`,
      month: currentMonth,
      year: currentYear,
      status: 'open',
      drawMethod: 'random',
      winningNumbers: [7, 18, 42, 63, 94],
      prizePool: 100000,
      jackpotRollover: true,
      jackpotAmount: 40000,
      lockDate,
      publishedAt: new Date(),
    });
  }

  return cycle;
};

// 1. GET /api/draw/current
export const getCurrentDraw = async (req: Request, res: Response): Promise<void> => {
  try {
    const cycle = await getActiveDrawCycle();
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id || (authReq.user as any)?._id;

    let userEntry = null;
    let userResult = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userEntry = await LuckyNumberEntry.findOne({
        userId,
        drawCycleId: cycle._id,
      });

      userResult = await DrawResult.findOne({
        userId,
        drawCycleId: cycle._id,
      });
    }

    const isLocked =
      cycle.status === 'locked' ||
      cycle.status === 'published' ||
      cycle.status === 'completed' ||
      new Date() > new Date(cycle.lockDate);

    res.status(200).json({
      success: true,
      cycle: {
        id: cycle._id.toString(),
        name: cycle.name,
        month: cycle.month,
        year: cycle.year,
        status: cycle.status,
        isLocked,
        drawMethod: cycle.drawMethod,
        winningNumbers: cycle.winningNumbers,
        prizePool: cycle.prizePool,
        jackpotRollover: cycle.jackpotRollover,
        jackpotAmount: cycle.jackpotAmount,
        lockDate: cycle.lockDate,
        drawnAt: cycle.drawnAt,
        publishedAt: cycle.publishedAt,
      },
      userEntry: userEntry
        ? {
            id: userEntry._id.toString(),
            numbers: userEntry.numbers,
            locked: userEntry.locked || isLocked,
            selectedAt: userEntry.selectedAt,
          }
        : null,
      userResult: userResult
        ? {
            id: userResult._id.toString(),
            matchCount: userResult.matchCount,
            matchedNumbers: userResult.matchedNumbers,
            prizeTier: userResult.prizeTier,
            prizeAmount: userResult.prizeAmount,
            paymentStatus: userResult.paymentStatus || 'NOT_WINNER',
            verificationStatus: userResult.verificationStatus || 'NONE',
            proofUrl: userResult.proofUrl || '',
            adminNote: userResult.adminNote || '',
            status: userResult.status,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching current draw:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monthly draw details.',
    });
  }
};

// 2. POST /api/draw/my-entry
export const saveMyLuckyNumbers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || (req.user as any)?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = await userStore.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    if (user.membershipStatus !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Active membership required to participate in the monthly draw.',
      });
      return;
    }

    const cycle = await getActiveDrawCycle();
    const isCycleLocked =
      cycle.status === 'locked' ||
      cycle.status === 'published' ||
      cycle.status === 'completed' ||
      new Date() > new Date(cycle.lockDate);

    if (isCycleLocked) {
      res.status(400).json({
        success: false,
        error: "This month's draw is locked. Selections can no longer be modified.",
      });
      return;
    }

    // Check if user's entry is individually locked
    const existingEntry = await LuckyNumberEntry.findOne({
      userId,
      drawCycleId: cycle._id,
    });

    if (existingEntry && existingEntry.locked) {
      res.status(400).json({
        success: false,
        error: "Your Lucky Numbers are locked for this month's draw.",
      });
      return;
    }

    const { numbers } = req.body;

    // Strict validation: exactly 5 numbers between 1 and 99
    if (!Array.isArray(numbers) || numbers.length !== 5) {
      res.status(400).json({
        success: false,
        error: 'You must select exactly 5 Lucky Numbers.',
      });
      return;
    }

    const parsedNumbers: number[] = [];
    for (const num of numbers) {
      const parsed = parseInt(num, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 99) {
        res.status(400).json({
          success: false,
          error: 'Every Lucky Number must be an integer between 1 and 99.',
        });
        return;
      }
      parsedNumbers.push(parsed);
    }

    // Ensure uniqueness within the user's selection
    const uniqueSet = new Set(parsedNumbers);
    if (uniqueSet.size !== 5) {
      res.status(400).json({
        success: false,
        error: 'All 5 Lucky Numbers must be unique within your selection.',
      });
      return;
    }

    const sortedNumbers = Array.from(uniqueSet).sort((a, b) => a - b);

    // Save or update entry
    const entry = await LuckyNumberEntry.findOneAndUpdate(
      { userId, drawCycleId: cycle._id },
      {
        numbers: sortedNumbers,
        selectedAt: new Date(),
        locked: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync to user profile cache
    user.luckyNumbers = sortedNumbers;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Your 5 Lucky Numbers have been saved successfully for this month's draw.",
      entry: {
        id: entry._id.toString(),
        numbers: entry.numbers,
        locked: entry.locked,
        selectedAt: entry.selectedAt,
      },
    });
  } catch (error: any) {
    console.error('Error saving lucky numbers:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to save Lucky Numbers.',
    });
  }
};

// 3. POST /api/draw/lock-my-entry
export const lockMyLuckyNumbers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || (req.user as any)?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const cycle = await getActiveDrawCycle();
    const entry = await LuckyNumberEntry.findOne({ userId, drawCycleId: cycle._id });

    if (!entry) {
      res.status(404).json({
        success: false,
        error: 'No Lucky Numbers selected yet for this draw cycle.',
      });
      return;
    }

    entry.locked = true;
    entry.lockedAt = new Date();
    await entry.save();

    res.status(200).json({
      success: true,
      message: "Your Lucky Numbers are locked for this month's draw.",
      entry: {
        id: entry._id.toString(),
        numbers: entry.numbers,
        locked: entry.locked,
        lockedAt: entry.lockedAt,
      },
    });
  } catch (error: any) {
    console.error('Error locking lucky numbers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lock Lucky Numbers.',
    });
  }
};

// 4. POST /api/draw/execute-draw
export const executeDraw = async (req: Request, res: Response): Promise<void> => {
  try {
    const cycle = await getActiveDrawCycle();

    // 1. Generate 5 unique winning numbers from 1 to 99 (never copying user scores/lucky numbers)
    const customNumbers = req.body.winningNumbers;
    let winningNumbers: number[];

    if (
      Array.isArray(customNumbers) &&
      customNumbers.length === 5 &&
      new Set(customNumbers).size === 5 &&
      customNumbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 99)
    ) {
      winningNumbers = customNumbers.map(Number).sort((a: number, b: number) => a - b);
    } else {
      winningNumbers = generateIndependentWinningNumbers();
    }

    // 2. Fetch all user entries for this cycle
    const entries = await LuckyNumberEntry.find({ drawCycleId: cycle._id });

    // 3. Match calculation across all participants
    // Note: Multiple users CAN have chosen identical numbers. Each gets matched individually.
    const tierWinners: { [tier: string]: typeof entries } = {
      '5-match': [],
      '4-match': [],
      '3-match': [],
      none: [],
    };

    const evaluatedResults: {
      userId: mongoose.Types.ObjectId;
      luckyNumbers: number[];
      matchCount: number;
      matchedNumbers: number[];
      tier: '5-match' | '4-match' | '3-match' | 'none';
    }[] = [];

    for (const entry of entries) {
      const matched = entry.numbers.filter((n) => winningNumbers.includes(n));
      const matchCount = matched.length;
      let tier: '5-match' | '4-match' | '3-match' | 'none' = 'none';

      if (matchCount === 5) tier = '5-match';
      else if (matchCount === 4) tier = '4-match';
      else if (matchCount === 3) tier = '3-match';

      tierWinners[tier].push(entry);
      evaluatedResults.push({
        userId: entry.userId,
        luckyNumbers: entry.numbers,
        matchCount,
        matchedNumbers: matched,
        tier,
      });
    }

    // 4. Calculate prize pool tiers according to PRD:
    // 5-match: 40% of prize pool + existing jackpot rollover
    // 4-match: 35% of prize pool (NO rollover)
    // 3-match: 25% of prize pool (NO rollover)
    // 0-2 matches: No prize
    const pool5 = (cycle.prizePool * 0.40) + (cycle.jackpotAmount > cycle.prizePool * 0.40 ? (cycle.jackpotAmount - cycle.prizePool * 0.40) : 0);
    const pool4 = cycle.prizePool * 0.35;
    const pool3 = cycle.prizePool * 0.25;

    const count5 = tierWinners['5-match'].length;
    const count4 = tierWinners['4-match'].length;
    const count3 = tierWinners['3-match'].length;

    // Multiple winners split their tier equally
    const prizePer5 = count5 > 0 ? Math.round(pool5 / count5) : 0;
    const prizePer4 = count4 > 0 ? Math.round(pool4 / count4) : 0;
    const prizePer3 = count3 > 0 ? Math.round(pool3 / count3) : 0;

    // Rollover rule: Only 5-match jackpot rolls over if 0 winners
    const jackpotRolloverOccurred = count5 === 0;

    // 5. Persist DrawResult for all users
    for (const resItem of evaluatedResults) {
      let prizeAmount = 0;
      let totalWinnersInTier = 0;
      let paymentStatus: 'NOT_WINNER' | 'PENDING' | 'PAID' = 'NOT_WINNER';

      if (resItem.tier === '5-match') {
        prizeAmount = prizePer5;
        totalWinnersInTier = count5;
        paymentStatus = 'PENDING';
      } else if (resItem.tier === '4-match') {
        prizeAmount = prizePer4;
        totalWinnersInTier = count4;
        paymentStatus = 'PENDING';
      } else if (resItem.tier === '3-match') {
        prizeAmount = prizePer3;
        totalWinnersInTier = count3;
        paymentStatus = 'PENDING';
      }

      await DrawResult.findOneAndUpdate(
        { userId: resItem.userId, drawCycleId: cycle._id },
        {
          luckyNumbers: resItem.luckyNumbers,
          winningNumbers,
          matchCount: resItem.matchCount,
          matchedNumbers: resItem.matchedNumbers,
          prizeTier: resItem.tier,
          prizeAmount,
          totalWinnersInTier,
          paymentStatus,
          verificationStatus: 'NONE',
          status: prizeAmount > 0 ? 'awarded' : 'none',
        },
        { upsert: true, new: true }
      );
    }

    // 6. Update Draw Cycle
    cycle.winningNumbers = winningNumbers;
    cycle.drawnAt = new Date();
    cycle.publishedAt = new Date();
    cycle.status = 'published';
    cycle.jackpotRollover = jackpotRolloverOccurred;
    if (jackpotRolloverOccurred) {
      // 40% jackpot amount rolls into next month's jackpot
      cycle.jackpotAmount = pool5;
    } else {
      // Reset to base 40%
      cycle.jackpotAmount = cycle.prizePool * 0.40;
    }
    await cycle.save();

    res.status(200).json({
      success: true,
      message: 'Monthly Draw executed and results published successfully.',
      drawCycle: {
        id: cycle._id.toString(),
        month: cycle.month,
        year: cycle.year,
        winningNumbers,
        prizePool: cycle.prizePool,
        tierAllocations: {
          '5-match': { pool: pool5, winners: count5, perWinner: prizePer5, rollover: jackpotRolloverOccurred },
          '4-match': { pool: pool4, winners: count4, perWinner: prizePer4, rollover: false },
          '3-match': { pool: pool3, winners: count3, perWinner: prizePer3, rollover: false },
        },
        totalParticipants: entries.length,
      },
    });
  } catch (error: any) {
    console.error('Error executing draw:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to execute draw.',
    });
  }
};

// 5. POST /api/draw/verify-winner (Winner uploads proof of golf performance)
export const submitWinnerProof = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || (req.user as any)?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { proofUrl, drawId } = req.body;
    if (!proofUrl || typeof proofUrl !== 'string' || proofUrl.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'A valid screenshot or document proof URL is required.',
      });
      return;
    }

    const cycle = drawId ? await DrawCycle.findById(drawId) : await getActiveDrawCycle();
    if (!cycle) {
      res.status(404).json({ success: false, error: 'Draw cycle not found.' });
      return;
    }

    // Locate winner's draw result
    const drawResult = await DrawResult.findOne({
      userId,
      drawCycleId: cycle._id,
    });

    if (!drawResult) {
      res.status(404).json({
        success: false,
        error: 'No draw result found for this user in this cycle.',
      });
      return;
    }

    if (drawResult.matchCount < 3 || drawResult.prizeAmount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Winner verification is only required for winning tiers (3, 4, or 5 matches).',
      });
      return;
    }

    // Record or update WinnerVerification document
    const verification = await WinnerVerification.findOneAndUpdate(
      { userId, drawId: cycle._id, drawResultId: drawResult._id },
      {
        proofUrl: proofUrl.trim(),
        status: 'PENDING',
        submittedAt: new Date(),
        reviewedAt: null,
      },
      { upsert: true, new: true }
    );

    // Update DrawResult
    drawResult.verificationStatus = 'PENDING';
    drawResult.proofUrl = proofUrl.trim();
    await drawResult.save();

    res.status(200).json({
      success: true,
      message: 'Proof submitted successfully. Verification status is PENDING review.',
      verification: {
        id: verification._id.toString(),
        status: verification.status,
        proofUrl: verification.proofUrl,
        submittedAt: verification.submittedAt,
      },
    });
  } catch (error: any) {
    console.error('Error submitting winner proof:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to submit winner verification proof.',
    });
  }
};

// 6. GET /api/draw/my-winnings (User's complete winning history)
export const getMyWinnings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || (req.user as any)?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const cycle = await getActiveDrawCycle();
    const results = await DrawResult.find({ userId })
      .populate('drawCycleId')
      .sort({ createdAt: -1 });

    const winnings = results.map((r: any) => {
      const draw = r.drawCycleId || cycle;
      return {
        id: r._id.toString(),
        drawId: draw._id ? draw._id.toString() : cycle._id.toString(),
        drawName: draw.name || `${draw.month} ${draw.year} Draw`,
        month: draw.month || cycle.month,
        year: draw.year || cycle.year,
        luckyNumbers: r.luckyNumbers,
        winningNumbers: r.winningNumbers,
        matchCount: r.matchCount,
        matchedNumbers: r.matchedNumbers,
        prizeTier: r.prizeTier,
        prizeAmount: r.prizeAmount,
        paymentStatus: r.paymentStatus || (r.prizeAmount > 0 ? 'PENDING' : 'NOT_WINNER'),
        verificationStatus: r.verificationStatus || 'NONE',
        proofUrl: r.proofUrl || '',
        adminNote: r.adminNote || '',
        createdAt: r.createdAt,
      };
    });

    const totalWon = winnings
      .filter((w) => w.matchCount >= 3)
      .reduce((sum, w) => sum + w.prizeAmount, 0);

    res.status(200).json({
      success: true,
      winnings,
      totalWon,
    });
  } catch (error: any) {
    console.error('Error fetching winnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve winnings history.',
    });
  }
};

// ============================================================================
// ADMIN-READY CONTROLLERS
// ============================================================================

// 7. GET /api/draw/admin/verifications
export const getAdminVerifications = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const verifications = await WinnerVerification.find()
      .populate('userId', 'fullName email')
      .populate('drawId', 'name month year')
      .populate('drawResultId')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      verifications,
    });
  } catch (error: any) {
    console.error('Error fetching admin verifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verifications.',
    });
  }
};

// 8. POST /api/draw/admin/review-verification
export const reviewWinnerVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { verificationId, status, adminNote } = req.body;

    if (!verificationId || !['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({
        success: false,
        error: "verificationId and valid status ('APPROVED' or 'REJECTED') are required.",
      });
      return;
    }

    const verification = await WinnerVerification.findById(verificationId);
    if (!verification) {
      res.status(404).json({ success: false, error: 'Verification record not found.' });
      return;
    }

    verification.status = status;
    verification.adminNote = adminNote || '';
    verification.reviewedAt = new Date();
    await verification.save();

    // Sync to DrawResult
    await DrawResult.findByIdAndUpdate(verification.drawResultId, {
      verificationStatus: status,
      adminNote: adminNote || '',
      reviewedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Winner verification has been ${status.toLowerCase()}.`,
      verification,
    });
  } catch (error: any) {
    console.error('Error reviewing verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review verification.',
    });
  }
};

// 9. POST /api/draw/admin/mark-payout
export const markPayoutPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drawResultId } = req.body;
    if (!drawResultId) {
      res.status(400).json({ success: false, error: 'drawResultId is required.' });
      return;
    }

    const result = await DrawResult.findById(drawResultId);
    if (!result) {
      res.status(404).json({ success: false, error: 'Draw result not found.' });
      return;
    }

    if (result.matchCount < 3 || result.prizeAmount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot mark payout for non-winning result.',
      });
      return;
    }

    result.paymentStatus = 'PAID';
    result.paidAt = new Date();
    await result.save();

    res.status(200).json({
      success: true,
      message: 'Payout status marked as PAID.',
      result,
    });
  } catch (error: any) {
    console.error('Error marking payout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payout status.',
    });
  }
};

// 10. POST /api/draw/admin/lock-draw
export const adminLockDraw = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cycle = await getActiveDrawCycle();
    cycle.status = 'locked';
    await cycle.save();

    res.status(200).json({
      success: true,
      message: 'Draw is now LOCKED. No further lucky number selections allowed.',
      cycle,
    });
  } catch (error: any) {
    console.error('Error locking draw:', error);
    res.status(500).json({ success: false, error: 'Failed to lock draw.' });
  }
};

// 11. POST /api/draw/admin/open-draw
export const adminOpenDraw = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cycle = await getActiveDrawCycle();
    cycle.status = 'open';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    cycle.lockDate = futureDate;
    await cycle.save();

    res.status(200).json({
      success: true,
      message: 'Draw cycle is now OPEN for lucky number submissions.',
      cycle,
    });
  } catch (error: any) {
    console.error('Error opening draw:', error);
    res.status(500).json({ success: false, error: 'Failed to open draw.' });
  }
};
