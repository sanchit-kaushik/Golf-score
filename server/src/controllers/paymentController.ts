import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getPlanConfig } from '../config/plans.js';
import { getRazorpayClient, isRazorpayReady, getRazorpayKeyId } from '../config/razorpay.js';
import {
  verifyRazorpayOrderSignature,
  verifyRazorpaySubscriptionSignature,
  verifyRazorpayWebhookSignature,
} from '../utils/paymentVerification.js';
import { userStore } from '../utils/userStore.js';
import { Payment } from '../models/Payment.js';
import { isConnectedToMongoDB } from '../config/db.js';

export const paymentController = {
  /**
   * GET /api/payments/config
   * Returns public configuration for client-side Razorpay Checkout
   */
  async getConfig(_req: Request, res: Response): Promise<void> {
    const isConfigured = isRazorpayReady();
    const keyId = getRazorpayKeyId();
    const currency = (process.env.RAZORPAY_CURRENCY || 'INR').toUpperCase();

    res.status(200).json({
      isConfigured,
      keyId,
      currency,
      hasMonthlySubscriptionPlan: Boolean(process.env.RAZORPAY_MONTHLY_PLAN_ID),
      hasYearlySubscriptionPlan: Boolean(process.env.RAZORPAY_YEARLY_PLAN_ID),
    });
  },

  /**
   * POST /api/payments/create-order
   * Creates an official Razorpay Order or Subscription
   * Protected route: user is authenticated via requireAuth
   */
  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized. Authentication required.' });
        return;
      }

      const { planId, charityId, charityPledgePercent } = req.body;

      if (!planId || (planId !== 'monthly' && planId !== 'yearly')) {
        res.status(400).json({
          success: false,
          error: "Invalid planId. Must be either 'monthly' or 'yearly'.",
        });
        return;
      }

      // Authoritative server-side plan & price determination
      const plan = getPlanConfig(planId);
      if (!plan) {
        res.status(400).json({ success: false, error: 'Plan configuration not found.' });
        return;
      }

      // Verify Razorpay credentials
      if (!isRazorpayReady()) {
        res.status(503).json({
          success: false,
          error:
            'Razorpay credentials are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env to enable live payment checkout.',
          isConfigured: false,
          missingConfig: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
        });
        return;
      }

      const razorpay = getRazorpayClient()!;

      // If Razorpay Plan ID is configured for recurring subscriptions, initiate Subscription
      if (plan.razorpayPlanId) {
        try {
          const subscription = await razorpay.subscriptions.create({
            plan_id: plan.razorpayPlanId,
            total_count: planId === 'yearly' ? 10 : 60,
            customer_notify: 1,
            notes: {
              userId: user.id || user._id,
              userEmail: user.email,
              planId,
              charityId: charityId || 'youth-golf',
              charityPledgePercent: String(charityPledgePercent || 10),
            },
          });

          // Save payment record in DB if connected
          if (isConnectedToMongoDB) {
            await Payment.create({
              userId: user.id || user._id,
              userEmail: user.email,
              planId,
              type: 'subscription',
              amount: plan.amount,
              currency: plan.currency,
              status: 'created',
              razorpaySubscriptionId: subscription.id,
              metadata: { charityId, charityPledgePercent },
            });
          }

          res.status(200).json({
            success: true,
            paymentType: 'subscription',
            subscriptionId: subscription.id,
            amount: plan.amount,
            currency: plan.currency,
            keyId: getRazorpayKeyId(),
            plan: {
              id: plan.id,
              name: plan.name,
              displayPrice: plan.displayPrice,
              currency: plan.currency,
              billingPeriod: plan.billingPeriod,
            },
          });
          return;
        } catch (subErr: any) {
          console.warn('⚠️ [Razorpay] Recurring subscription creation error, falling back to standard Order:', subErr?.message);
        }
      }

      // Standard Razorpay Order creation
      const receipt = `dh_${(user.id || user._id).toString().slice(-6)}_${Date.now().toString().slice(-6)}`;
      const order = await razorpay.orders.create({
        amount: plan.amount,
        currency: plan.currency,
        receipt,
        notes: {
          userId: (user.id || user._id).toString(),
          userEmail: user.email,
          planId,
          charityId: charityId || 'youth-golf',
          charityPledgePercent: String(charityPledgePercent || 10),
        },
      });

      // Save initial payment audit record
      if (isConnectedToMongoDB) {
        await Payment.create({
          userId: user.id || user._id,
          userEmail: user.email,
          planId,
          type: 'order',
          amount: plan.amount,
          currency: plan.currency,
          status: 'created',
          razorpayOrderId: order.id,
          metadata: { receipt, charityId, charityPledgePercent },
        });
      }

      res.status(200).json({
        success: true,
        paymentType: 'order',
        orderId: order.id,
        amount: plan.amount,
        currency: plan.currency,
        keyId: getRazorpayKeyId(),
        plan: {
          id: plan.id,
          name: plan.name,
          displayPrice: plan.displayPrice,
          currency: plan.currency,
          billingPeriod: plan.billingPeriod,
        },
      });
    } catch (error: any) {
      console.error('❌ [Razorpay createOrder Error]:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Failed to create payment order with Razorpay.',
      });
    }
  },

  /**
   * POST /api/payments/verify
   * Cryptographically verifies Razorpay signature before activating membership
   * Protected route: user is authenticated via requireAuth
   */
  async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized. Authentication required.' });
        return;
      }

      const {
        planId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
        charityId,
        charityPledgePercent,
      } = req.body;

      if (!planId || (planId !== 'monthly' && planId !== 'yearly')) {
        res.status(400).json({ success: false, error: 'Valid planId is required.' });
        return;
      }

      if (!razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({
          success: false,
          error: 'Missing required Razorpay payment confirmation parameters.',
        });
        return;
      }

      // Check if signature matches
      let isValidSignature = false;

      if (razorpay_subscription_id) {
        // Subscription signature verification: payment_id + "|" + subscription_id
        isValidSignature = verifyRazorpaySubscriptionSignature({
          subscriptionId: razorpay_subscription_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        });
      } else if (razorpay_order_id) {
        // Order signature verification: order_id + "|" + payment_id
        isValidSignature = verifyRazorpayOrderSignature({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Either razorpay_order_id or razorpay_subscription_id must be provided.',
        });
        return;
      }

      const plan = getPlanConfig(planId)!;

      // If signature verification fails, reject payment and do NOT activate membership!
      if (!isValidSignature) {
        console.error('❌ [Razorpay Verification Failed]: Signature mismatch for user', user.email);

        if (isConnectedToMongoDB) {
          await Payment.create({
            userId: user.id || user._id,
            userEmail: user.email,
            planId,
            type: razorpay_subscription_id ? 'subscription' : 'order',
            amount: plan.amount,
            currency: plan.currency,
            status: 'failed',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySubscriptionId: razorpay_subscription_id,
            razorpaySignature: razorpay_signature,
            errorReason: 'Cryptographic signature mismatch.',
          });
        }

        res.status(400).json({
          success: false,
          error: 'Invalid payment signature. Payment verification failed. Membership not activated.',
        });
        return;
      }

      // Signature is 100% verified!
      // Update User in MongoDB / store to ACTIVE & REAL
      const updatedUser = await userStore.activateRealMembership(
        (user.id || user._id).toString(),
        {
          planId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySubscriptionId: razorpay_subscription_id,
          razorpaySignature: razorpay_signature,
          amount: plan.amount,
          currency: plan.currency,
          selectedCharity: charityId,
          charityContributionPercentage: charityPledgePercent,
        }
      );

      // Record verified payment
      if (isConnectedToMongoDB) {
        await Payment.create({
          userId: user.id || user._id,
          userEmail: user.email,
          planId,
          type: razorpay_subscription_id ? 'subscription' : 'order',
          amount: plan.amount,
          currency: plan.currency,
          status: 'verified',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySubscriptionId: razorpay_subscription_id,
          razorpaySignature: razorpay_signature,
          metadata: { charityId, charityPledgePercent },
        });
      }

      console.log(`✅ [Razorpay Success] Membership activated for user ${user.email} (mode: real, plan: ${planId})`);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully. Membership is now ACTIVE.',
        user: typeof updatedUser.toJSON === 'function' ? updatedUser.toJSON() : updatedUser,
      });
    } catch (error: any) {
      console.error('❌ [Razorpay verifyPayment Error]:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Server error during payment verification.',
      });
    }
  },

  /**
   * POST /api/payments/webhook
   * Razorpay Webhook Handler for automated subscription and payment lifecycle events
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      // Verify webhook signature if secret is configured
      if (process.env.RAZORPAY_WEBHOOK_SECRET) {
        const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
        if (!isValid) {
          console.warn('⚠️ [Razorpay Webhook] Invalid webhook signature received.');
          res.status(400).json({ error: 'Invalid webhook signature' });
          return;
        }
      }

      const event = req.body;
      const eventType = event?.event;
      console.log(`ℹ️ [Razorpay Webhook Event] Received: ${eventType}`);

      switch (eventType) {
        case 'payment.captured': {
          const paymentEntity = event.payload?.payment?.entity;
          console.log(`💰 [Razorpay Webhook] Payment captured: ${paymentEntity?.id} for ${paymentEntity?.amount}`);
          break;
        }
        case 'payment.failed': {
          const paymentEntity = event.payload?.payment?.entity;
          console.log(`⚠️ [Razorpay Webhook] Payment failed: ${paymentEntity?.id}, error: ${paymentEntity?.error_description}`);
          break;
        }
        case 'subscription.activated': {
          const subEntity = event.payload?.subscription?.entity;
          console.log(`🎉 [Razorpay Webhook] Subscription activated: ${subEntity?.id}`);
          break;
        }
        case 'subscription.cancelled':
        case 'subscription.paused': {
          const subEntity = event.payload?.subscription?.entity;
          console.log(`⚠️ [Razorpay Webhook] Subscription state change (${eventType}): ${subEntity?.id}`);
          break;
        }
        default:
          console.log(`ℹ️ [Razorpay Webhook] Unhandled event type: ${eventType}`);
      }

      res.status(200).json({ status: 'ok', received: true });
    } catch (error: any) {
      console.error('❌ [Razorpay Webhook Error]:', error);
      res.status(500).json({ error: error?.message || 'Webhook processing failed' });
    }
  },
};
