import { Router } from 'express';
import { donationController } from '../controllers/donationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const donationRoutes = Router();

// All donation endpoints require authentication
donationRoutes.post('/create-order', requireAuth, donationController.createDonationOrder);
donationRoutes.post('/verify', requireAuth, donationController.verifyDonation);
donationRoutes.get('/my-donations', requireAuth, donationController.getMyDonations);
