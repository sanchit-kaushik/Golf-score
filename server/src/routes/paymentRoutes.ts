import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public configuration route (returns public keyId and plan config, NO secrets)
router.get('/config', paymentController.getConfig);

// Authenticated payment order / subscription creation
router.post('/create-order', requireAuth, paymentController.createOrder);

// Authenticated Razorpay signature verification and membership activation
router.post('/verify', requireAuth, paymentController.verifyPayment);

// Razorpay Webhook endpoint
router.post('/webhook', paymentController.handleWebhook);

export const paymentRoutes = router;
