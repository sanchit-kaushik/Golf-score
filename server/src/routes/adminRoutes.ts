import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminOverview,
  getAdminUsers,
  updateAdminUserRole,
  getAdminCharities,
  createAdminCharity,
  updateAdminCharity,
  getAdminDonations,
  getAdminWinners,
  updateAdminWinnerVerification,
  markAdminWinnerPayout,
  simulateDraw,
  generateWinningNumbers,
  getAdminReports,
} from '../controllers/adminController.js';
import {
  executeDraw,
  adminLockDraw,
  adminOpenDraw,
  getCurrentDraw,
} from '../controllers/drawController.js';

const router = Router();

// Apply administrative protection to ALL endpoints in this router
router.use(requireAuth);
router.use(requireAdmin);

// Overview Metrics
router.get('/overview', getAdminOverview);

// User Management
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateAdminUserRole);

// Charity Management
router.get('/charities', getAdminCharities);
router.post('/charities', createAdminCharity);
router.put('/charities/:id', updateAdminCharity);

// Independent Donations
router.get('/donations', getAdminDonations);

// Draw Management
router.get('/draws/current', getCurrentDraw);
router.post('/draws/simulate', simulateDraw);
router.post('/draws/generate-numbers', generateWinningNumbers);
router.post('/draws/lock', adminLockDraw);
router.post('/draws/open', adminOpenDraw);
router.post('/draws/execute', executeDraw);

// Winner Verification & Payouts
router.get('/winners', getAdminWinners);
router.put('/winners/:id/verification', updateAdminWinnerVerification);
router.put('/winners/:id/payout', markAdminWinnerPayout);

// Reports
router.get('/reports', getAdminReports);

export default router;
