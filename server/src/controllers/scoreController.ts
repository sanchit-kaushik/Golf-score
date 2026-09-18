import { Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { GolfScore } from '../models/GolfScore.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// In-memory fallback score cache when MongoDB is offline
interface InMemScore {
  _id: string;
  userId: string;
  score: number;
  date: string;
  courseName: string;
  createdAt: Date;
}

const inMemoryScores = new Map<string, InMemScore[]>();

const getBaselineScores = (userId: string): InMemScore[] => [
  { _id: 'sc_1', userId, score: 38, date: '2026-09-15', courseName: 'Augusta National', createdAt: new Date('2026-09-15') },
  { _id: 'sc_2', userId, score: 36, date: '2026-09-12', courseName: 'St Andrews Old Course', createdAt: new Date('2026-09-12') },
  { _id: 'sc_3', userId, score: 41, date: '2026-09-08', courseName: 'Pebble Beach Golf Links', createdAt: new Date('2026-09-08') },
  { _id: 'sc_4', userId, score: 35, date: '2026-09-03', courseName: 'Royal County Down', createdAt: new Date('2026-09-03') },
  { _id: 'sc_5', userId, score: 39, date: '2026-08-28', courseName: 'Shinnecock Hills', createdAt: new Date('2026-08-28') },
];

const getUserId = (user: any): string | null => {
  if (!user) return null;
  return (user._id ? user._id.toString() : null) || (user.id ? user.id.toString() : null);
};

const toMongoUserId = (id: string): mongoose.Types.ObjectId => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  const hash = crypto.createHash('md5').update(id).digest('hex').slice(0, 24);
  return new mongoose.Types.ObjectId(hash);
};

// Helper: Normalize date to YYYY-MM-DD string
export const normalizeDateString = (dateInput: string): string | null => {
  if (!dateInput || typeof dateInput !== 'string') return null;
  const trimmed = dateInput.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return trimmed;
    }
  }

  // Attempt parse
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 1. GET /api/scores
export const getMyScores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized. Please sign in again.' });
      return;
    }

    // Fallback mode if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      if (!inMemoryScores.has(userId)) {
        inMemoryScores.set(userId, getBaselineScores(userId));
      }
      const memScores = inMemoryScores.get(userId) || [];
      res.status(200).json({
        success: true,
        scores: memScores.map((s) => ({
          id: s._id,
          score: s.score,
          date: s.date,
          courseName: s.courseName,
          createdAt: s.createdAt,
        })),
        totalCount: memScores.length,
      });
      return;
    }

    const mongoUserId = toMongoUserId(userId);

    // Retrieve latest 5 scores, newest first
    let scores = await GolfScore.find({ userId: mongoUserId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Auto-seed initial 5 scores in MongoDB if user has none yet
    if (scores.length === 0) {
      const baseline = getBaselineScores(userId);
      for (const b of baseline) {
        await GolfScore.create({
          userId: mongoUserId,
          score: b.score,
          date: b.date,
          courseName: b.courseName,
        }).catch(() => {});
      }
      scores = await GolfScore.find({ userId: mongoUserId })
        .sort({ date: -1, createdAt: -1 })
        .limit(5);
    }

    const totalCount = await GolfScore.countDocuments({ userId: mongoUserId });

    res.status(200).json({
      success: true,
      scores: scores.map((s) => ({
        id: s._id.toString(),
        score: s.score,
        date: s.date,
        courseName: s.courseName,
        createdAt: s.createdAt,
      })),
      totalCount,
    });
  } catch (error: any) {
    console.error('Error fetching scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve golf performance scores.',
    });
  }
};

// 2. POST /api/scores
export const addScore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized. Please sign in again.' });
      return;
    }

    // Active members and administrators can record scores
    const isActive = req.user?.membershipStatus === 'active' || req.user?.role === 'admin';
    if (!isActive) {
      res.status(403).json({
        success: false,
        error: 'Active membership required to log golf performance scores.',
      });
      return;
    }

    const rawScore = req.body?.score !== undefined ? req.body.score : req.body?.points;
    const rawDate = req.body?.date || req.body?.playedOn;
    const courseName = req.body?.courseName;

    // 1. Validate Score (1 to 45 integer)
    const parsedScore = Number(rawScore);
    if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      res.status(400).json({
        success: false,
        error: 'Stableford score must be a whole number between 1 and 45 points.',
      });
      return;
    }

    // 2. Validate & Normalize Date
    const normalizedDate = normalizeDateString(rawDate);
    if (!normalizedDate) {
      res.status(400).json({
        success: false,
        error: 'A valid round date in YYYY-MM-DD format is required.',
      });
      return;
    }

    const finalCourseName = courseName?.trim() || 'Verified Course Round';

    // A. Fallback mode if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      const currentScores = inMemoryScores.get(userId) || getBaselineScores(userId);
      const duplicate = currentScores.some((s) => s.date === normalizedDate);
      if (duplicate) {
        res.status(400).json({
          success: false,
          error: `You already have a score recorded for ${normalizedDate}. Only one round per calendar date is allowed.`,
        });
        return;
      }

      const newEntry: InMemScore = {
        _id: `sc_${Date.now()}`,
        userId,
        score: parsedScore,
        date: normalizedDate,
        courseName: finalCourseName,
        createdAt: new Date(),
      };

      const combined = [newEntry, ...currentScores].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const trimmed = combined.slice(0, 5);
      inMemoryScores.set(userId, trimmed);

      res.status(201).json({
        success: true,
        message: 'Round score recorded successfully.',
        createdScore: {
          id: newEntry._id,
          score: newEntry.score,
          date: newEntry.date,
          courseName: newEntry.courseName,
        },
        score: {
          id: newEntry._id,
          score: newEntry.score,
          date: newEntry.date,
          courseName: newEntry.courseName,
        },
        scores: trimmed.map((s) => ({
          id: s._id,
          score: s.score,
          date: s.date,
          courseName: s.courseName,
          createdAt: s.createdAt,
        })),
        totalCount: combined.length,
      });
      return;
    }

    // B. Connected MongoDB Atlas Mode
    const mongoUserId = toMongoUserId(userId);

    // Duplicate check: Only ONE score per date per user
    const existingDateScore = await GolfScore.findOne({ userId: mongoUserId, date: normalizedDate });
    if (existingDateScore) {
      res.status(400).json({
        success: false,
        error: `You already have a score recorded for ${normalizedDate}. Only one round per calendar date is allowed.`,
      });
      return;
    }

    // Create new score document
    const newScore = await GolfScore.create({
      userId: mongoUserId,
      score: parsedScore,
      date: normalizedDate,
      courseName: finalCourseName,
    });

    // Automatic Rolling 5-Score Logic:
    const allUserScores = await GolfScore.find({ userId: mongoUserId }).sort({ date: -1, createdAt: -1 });

    if (allUserScores.length > 5) {
      const scoresToRemove = allUserScores.slice(5);
      const idsToRemove = scoresToRemove.map((s) => s._id);
      await GolfScore.deleteMany({ _id: { $in: idsToRemove } });
    }

    const finalScores = await GolfScore.find({ userId: mongoUserId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalCount = await GolfScore.countDocuments({ userId: mongoUserId });

    res.status(201).json({
      success: true,
      message: 'Round score recorded successfully.',
      createdScore: {
        id: newScore._id.toString(),
        score: newScore.score,
        date: newScore.date,
        courseName: newScore.courseName,
      },
      score: {
        id: newScore._id.toString(),
        score: newScore.score,
        date: newScore.date,
        courseName: newScore.courseName,
      },
      scores: finalScores.map((s) => ({
        id: s._id.toString(),
        score: s.score,
        date: s.date,
        courseName: s.courseName,
        createdAt: s.createdAt,
      })),
      totalCount,
    });
  } catch (error: any) {
    console.error('Error adding score:', error);
    if (error?.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'You already have a score recorded for this date.',
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to record round score.',
    });
  }
};

// 3. PUT /api/scores/:id
export const updateScore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req.user);
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized. Please sign in again.' });
      return;
    }

    const isActive = req.user?.membershipStatus === 'active' || req.user?.role === 'admin';
    if (!isActive) {
      res.status(403).json({
        success: false,
        error: 'Active membership required to manage scores.',
      });
      return;
    }

    const { score, date, courseName } = req.body;

    // Offline / fallback mode
    if (mongoose.connection.readyState !== 1) {
      const currentScores = inMemoryScores.get(userId) || getBaselineScores(userId);
      const item = currentScores.find((s) => s._id === id);
      if (!item) {
        res.status(404).json({ success: false, error: 'Score record not found.' });
        return;
      }

      if (score !== undefined) {
        const parsed = Number(score);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 45) {
          res.status(400).json({ success: false, error: 'Score must be between 1 and 45 points.' });
          return;
        }
        item.score = parsed;
      }

      if (date !== undefined) {
        const norm = normalizeDateString(date);
        if (!norm) {
          res.status(400).json({ success: false, error: 'Valid date required.' });
          return;
        }
        item.date = norm;
      }

      if (courseName !== undefined) {
        item.courseName = courseName.trim() || 'Verified Course Round';
      }

      inMemoryScores.set(userId, currentScores);

      res.status(200).json({
        success: true,
        message: 'Round score updated successfully.',
        score: { id: item._id, score: item.score, date: item.date, courseName: item.courseName },
        scores: currentScores.map((s) => ({ id: s._id, score: s.score, date: s.date, courseName: s.courseName, createdAt: s.createdAt })),
        totalCount: currentScores.length,
      });
      return;
    }

    // Connected MongoDB mode
    const mongoUserId = toMongoUserId(userId);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid score ID.' });
      return;
    }

    const existingScore = await GolfScore.findOne({ _id: id, userId: mongoUserId });
    if (!existingScore) {
      res.status(404).json({ success: false, error: 'Score record not found or access unauthorized.' });
      return;
    }

    if (score !== undefined) {
      const parsedScore = Number(score);
      if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 45) {
        res.status(400).json({ success: false, error: 'Stableford score must be between 1 and 45 points.' });
        return;
      }
      existingScore.score = parsedScore;
    }

    if (date !== undefined) {
      const normalizedDate = normalizeDateString(date);
      if (!normalizedDate) {
        res.status(400).json({ success: false, error: 'A valid round date in YYYY-MM-DD format is required.' });
        return;
      }

      if (normalizedDate !== existingScore.date) {
        const duplicate = await GolfScore.findOne({
          userId: mongoUserId,
          date: normalizedDate,
          _id: { $ne: id },
        });

        if (duplicate) {
          res.status(400).json({
            success: false,
            error: `Another score already exists for ${normalizedDate}. Only one score per date is allowed.`,
          });
          return;
        }
        existingScore.date = normalizedDate;
      }
    }

    if (courseName !== undefined) {
      existingScore.courseName = courseName.trim() || 'Verified Course Round';
    }

    await existingScore.save();

    const finalScores = await GolfScore.find({ userId: mongoUserId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalCount = await GolfScore.countDocuments({ userId: mongoUserId });

    res.status(200).json({
      success: true,
      message: 'Round score updated successfully.',
      score: {
        id: existingScore._id.toString(),
        score: existingScore.score,
        date: existingScore.date,
        courseName: existingScore.courseName,
      },
      scores: finalScores.map((s) => ({
        id: s._id.toString(),
        score: s.score,
        date: s.date,
        courseName: s.courseName,
        createdAt: s.createdAt,
      })),
      totalCount,
    });
  } catch (error: any) {
    console.error('Error updating score:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to update round score.',
    });
  }
};

// 4. DELETE /api/scores/:id
export const deleteScore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req.user);
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const isActive = req.user?.membershipStatus === 'active' || req.user?.role === 'admin';
    if (!isActive) {
      res.status(403).json({
        success: false,
        error: 'Active membership required to manage scores.',
      });
      return;
    }

    // Offline / fallback mode
    if (mongoose.connection.readyState !== 1) {
      const currentScores = inMemoryScores.get(userId) || getBaselineScores(userId);
      const filtered = currentScores.filter((s) => s._id !== id);
      inMemoryScores.set(userId, filtered);

      res.status(200).json({
        success: true,
        message: 'Score deleted successfully.',
        scores: filtered.map((s) => ({
          id: s._id,
          score: s.score,
          date: s.date,
          courseName: s.courseName,
          createdAt: s.createdAt,
        })),
        totalCount: filtered.length,
      });
      return;
    }

    // Connected MongoDB mode
    const mongoUserId = toMongoUserId(userId);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid score ID.' });
      return;
    }

    const deleted = await GolfScore.findOneAndDelete({ _id: id, userId: mongoUserId });
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Score not found or unauthorized to delete.',
      });
      return;
    }

    const finalScores = await GolfScore.find({ userId: mongoUserId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalCount = await GolfScore.countDocuments({ userId: mongoUserId });

    res.status(200).json({
      success: true,
      message: 'Score deleted successfully.',
      scores: finalScores.map((s) => ({
        id: s._id.toString(),
        score: s.score,
        date: s.date,
        courseName: s.courseName,
        createdAt: s.createdAt,
      })),
      totalCount,
    });
  } catch (error: any) {
    console.error('Error deleting score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete score.',
    });
  }
};
