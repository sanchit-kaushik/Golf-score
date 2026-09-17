import { Router } from 'express';
import {
  getCurrentDraw,
  saveMyLuckyNumbers,
  lockMyLuckyNumbers,
  executeDraw,
  submitWinnerProof,
  getMyWinnings,
  getAdminVerifications,
  reviewWinnerVerification,
  markPayoutPaid,
  adminLockDraw,
  adminOpenDraw,
} from '../controllers/drawController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

export const drawRoutes = Router();

// Public / Authenticated read for current monthly draw
drawRoutes.get('/current', optionalAuth, getCurrentDraw);

// Authenticated user lucky number selection & locking
drawRoutes.post('/my-entry', requireAuth, saveMyLuckyNumbers);
drawRoutes.put('/my-entry', requireAuth, saveMyLuckyNumbers);
drawRoutes.post('/lock-my-entry', requireAuth, lockMyLuckyNumbers);

// Winner Proof Submission & Winnings
drawRoutes.post('/verify-winner', requireAuth, submitWinnerProof);
drawRoutes.get('/my-winnings', requireAuth, getMyWinnings);

// Draw Execution (Independent random 5 numbers & prize allocation)
drawRoutes.post('/execute-draw', executeDraw);

// Admin-Ready Endpoints
drawRoutes.get('/admin/verifications', getAdminVerifications);
drawRoutes.post('/admin/review-verification', reviewWinnerVerification);
drawRoutes.post('/admin/mark-payout', markPayoutPaid);
drawRoutes.post('/admin/lock-draw', adminLockDraw);
drawRoutes.post('/admin/open-draw', adminOpenDraw);
