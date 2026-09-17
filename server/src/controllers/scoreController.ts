import { Response } from 'express';
import mongoose from 'mongoose';
import { GolfScore } from '../models/GolfScore.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

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
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    // Retrieve latest 5 scores, newest first
    const scores = await GolfScore.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalCount = await GolfScore.countDocuments({ userId });

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
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    // Membership check: only active members (real or demo) can manage scores
    if (req.user?.membershipStatus !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Active membership required to log golf performance scores.',
      });
      return;
    }

    const { score, date, courseName } = req.body;

    // 1. Validate Score (1 to 45 integer)
    const parsedScore = Number(score);
    if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      res.status(400).json({
        success: false,
        error: 'Stableford score must be a whole number between 1 and 45 points.',
      });
      return;
    }

    // 2. Validate & Normalize Date
    const normalizedDate = normalizeDateString(date);
    if (!normalizedDate) {
      res.status(400).json({
        success: false,
        error: 'A valid round date in YYYY-MM-DD format is required.',
      });
      return;
    }

    // 3. Duplicate check: Only ONE score per date per user
    const existingDateScore = await GolfScore.findOne({ userId, date: normalizedDate });
    if (existingDateScore) {
      res.status(400).json({
        success: false,
        error: `You already have a score recorded for ${normalizedDate}. Only one round per calendar date is allowed.`,
      });
      return;
    }

    // 4. Create new score document
    const newScore = await GolfScore.create({
      userId,
      score: parsedScore,
      date: normalizedDate,
      courseName: courseName?.trim() || 'Verified Course Round',
    });

    // 5. Automatic Rolling 5-Score Logic:
    // Retrieve all scores for this user sorted newest first (by date descending)
    const allUserScores = await GolfScore.find({ userId }).sort({ date: -1, createdAt: -1 });

    if (allUserScores.length > 5) {
      // Retain newest 5; delete the oldest
      const scoresToRemove = allUserScores.slice(5);
      const idsToRemove = scoresToRemove.map((s) => s._id);
      await GolfScore.deleteMany({ _id: { $in: idsToRemove } });
    }

    // 6. Return final latest 5 scores (newest first)
    const finalScores = await GolfScore.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalCount = await GolfScore.countDocuments({ userId });

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
    // MongoDB duplicate key error safeguard (code 11000)
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
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid score ID.' });
      return;
    }

    if (req.user?.membershipStatus !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Active membership required to manage scores.',
      });
      return;
    }

    // Locate score and verify ownership
    const existingScore = await GolfScore.findOne({ _id: id, userId });
    if (!existingScore) {
      res.status(404).json({
        success: false,
        error: 'Score record not found or access unauthorized.',
      });
      return;
    }

    const { score, date, courseName } = req.body;

    // Validate score if provided
    if (score !== undefined) {
      const parsedScore = Number(score);
      if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 45) {
        res.status(400).json({
          success: false,
          error: 'Stableford score must be a whole number between 1 and 45 points.',
        });
        return;
      }
      existingScore.score = parsedScore;
    }

    // Validate date if changed
    if (date !== undefined) {
      const normalizedDate = normalizeDateString(date);
      if (!normalizedDate) {
        res.status(400).json({
          success: false,
          error: 'A valid round date in YYYY-MM-DD format is required.',
        });
        return;
      }

      if (normalizedDate !== existingScore.date) {
        // Check duplicate on new date
        const duplicate = await GolfScore.findOne({
          userId,
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

    // Re-query latest 5 scores sorted newest first
    const finalScores = await GolfScore.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalCount = await GolfScore.countDocuments({ userId });

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
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid score ID.' });
      return;
    }

    if (req.user?.membershipStatus !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Active membership required to manage scores.',
      });
      return;
    }

    const deleted = await GolfScore.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Score not found or unauthorized to delete.',
      });
      return;
    }

    // Return updated latest 5 scores
    const finalScores = await GolfScore.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalCount = await GolfScore.countDocuments({ userId });

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
