import { Router } from 'express';
import {
  activateDemoMembership,
  getMembershipStatus,
  updateCharity,
} from '../controllers/membershipController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/demo', requireAuth, activateDemoMembership);
router.get('/status', requireAuth, getMembershipStatus);
router.post('/charity', requireAuth, updateCharity);
router.put('/charity', requireAuth, updateCharity);

export default router;
