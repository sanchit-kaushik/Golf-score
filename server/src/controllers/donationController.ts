import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Donation } from '../models/Donation.js';
import { Charity } from '../models/Charity.js';
import { getRazorpayClient, isRazorpayReady, getRazorpayKeyId } from '../config/razorpay.js';
import { verifyRazorpayOrderSignature } from '../utils/paymentVerification.js';

// Strict allowed donation tiers (PRD / UI specification)
export const ALLOWED_DONATION_AMOUNTS = [250, 500, 1000, 2500];

// Fallback known charities map in case DB is being initialized
const KNOWN_FALLBACK_CHARITIES: Record<string, { id: string; name: string }> = {
  'youth-golf': { id: 'youth-golf', name: 'Youth Horizons in Sport' },
  'charity-1': { id: 'youth-golf', name: 'Youth Horizons in Sport' },
  'green-conservation': { id: 'green-conservation', name: 'Open Fairways Parkland Trust' },
  'charity-2': { id: 'green-conservation', name: 'Open Fairways Parkland Trust' },
  'accessible-athletics': { id: 'accessible-athletics', name: 'Adaptive Greens Initiative' },
  'charity-3': { id: 'accessible-athletics', name: 'Adaptive Greens Initiative' },
  'alzheimers-research': { id: 'alzheimers-research', name: 'Mind & Memory Health Trust' },
  'charity-4': { id: 'alzheimers-research', name: 'Mind & Memory Health Trust' },
};

export const donationController = {
  /**
   * POST /api/donations/create-order
   * Creates a one-time Razorpay order specifically for an independent donation
   */
  async createDonationOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized. Please sign in to make a donation.' });
        return;
      }

      const userId = user.id || user._id;
      const { charityId, amount } = req.body;

      // 1. Authoritative Backend Validation of Amount (Never trust frontend alone)
      const parsedAmount = Number(amount);
      if (!ALLOWED_DONATION_AMOUNTS.includes(parsedAmount)) {
        res.status(400).json({
          success: false,
          error: `Invalid donation amount (₹${amount}). Allowed amounts are ₹250, ₹500, ₹1,000, and ₹2,500.`,
        });
        return;
      }

      // 2. Validate Charity Exists & Is Active
      if (!charityId || typeof charityId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'A valid recipient charity must be selected.',
        });
        return;
      }

      let targetCharity = await Charity.findOne({
        $or: [
          { charityId: charityId.trim() },
          ...(mongoose.Types.ObjectId.isValid(charityId.trim())
            ? [{ _id: charityId.trim() }]
            : []),
        ],
        active: true,
      });

      let charityFinalId = charityId.trim();
      let charityFinalName = '';

      if (targetCharity) {
        charityFinalId = targetCharity.charityId;
        charityFinalName = targetCharity.name;
      } else if (KNOWN_FALLBACK_CHARITIES[charityId.trim()]) {
        const fallback = KNOWN_FALLBACK_CHARITIES[charityId.trim()];
        charityFinalId = fallback.id;
        charityFinalName = fallback.name;
      } else {
        res.status(400).json({
          success: false,
          error: 'The selected charity was not found or is currently inactive.',
        });
        return;
      }

      // 3. Verify Razorpay Configuration
      if (!isRazorpayReady()) {
        res.status(503).json({
          success: false,
          error:
            'Razorpay payment gateway is not configured on the server. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in server/.env.',
        });
        return;
      }

      const razorpay = getRazorpayClient()!;
      const amountInPaise = parsedAmount * 100; // Razorpay operates in lowest currency denomination (paise)
      const receipt = `don_${userId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`;

      // 4. Create one-time Razorpay Order
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          userId: userId.toString(),
          userEmail: user.email,
          charityId: charityFinalId,
          charityName: charityFinalName,
          donationType: 'independent_donation',
          environment: 'test_mode',
        },
      });

      // 5. Store pending donation record in MongoDB
      const donation = await Donation.create({
        userId,
        charityId: charityFinalId,
        charityName: charityFinalName,
        amount: parsedAmount,
        currency: 'INR',
        razorpayOrderId: order.id,
        status: 'pending',
      });

      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: getRazorpayKeyId(),
        charity: {
          id: charityFinalId,
          name: charityFinalName,
        },
        donationAmount: parsedAmount,
        donationId: donation._id.toString(),
      });
    } catch (error: any) {
      console.error('❌ [Donation createDonationOrder Error]:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to initialize donation order with payment gateway.',
      });
    }
  },

  /**
   * POST /api/donations/verify
   * Cryptographically verifies the Razorpay payment signature and updates donation status to 'paid'
   */
  async verifyDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const userId = user.id || user._id;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({
          success: false,
          error:
            'Incomplete payment response. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
        });
        return;
      }

      // 1. Locate existing donation record
      const donation = await Donation.findOne({
        razorpayOrderId: razorpay_order_id,
        userId,
      });

      if (!donation) {
        res.status(404).json({
          success: false,
          error: 'Corresponding donation order was not found for this user.',
        });
        return;
      }

      // Idempotency: If already paid, return existing verified status
      if (donation.status === 'paid') {
        res.status(200).json({
          success: true,
          message: 'Donation already verified and paid.',
          donation: {
            id: donation._id.toString(),
            charityId: donation.charityId,
            charityName: donation.charityName,
            amount: donation.amount,
            currency: donation.currency,
            status: 'paid',
            paidAt: donation.paidAt,
            razorpayPaymentId: donation.razorpayPaymentId,
          },
        });
        return;
      }

      // 2. Cryptographic HMAC-SHA256 Signature Verification
      const isValid = verifyRazorpayOrderSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });

      if (!isValid) {
        console.error(
          `❌ [Donation Verification Failed] Invalid HMAC-SHA256 signature for Order ${razorpay_order_id}`
        );
        donation.status = 'failed';
        await donation.save();

        res.status(400).json({
          success: false,
          error: 'Cryptographic signature verification failed. Donation could not be confirmed.',
        });
        return;
      }

      // 3. Mark donation as PAID
      donation.status = 'paid';
      donation.razorpayPaymentId = razorpay_payment_id;
      donation.razorpaySignature = razorpay_signature;
      donation.paidAt = new Date();
      await donation.save();

      console.log(
        `✅ [Donation Verified] User ${user.email} donated ₹${donation.amount} to "${donation.charityName}" (Payment ID: ${razorpay_payment_id})`
      );

      res.status(200).json({
        success: true,
        message: 'Donation payment verified and recorded successfully.',
        donation: {
          id: donation._id.toString(),
          charityId: donation.charityId,
          charityName: donation.charityName,
          amount: donation.amount,
          currency: donation.currency,
          status: 'paid',
          paidAt: donation.paidAt,
          razorpayPaymentId: donation.razorpayPaymentId,
        },
      });
    } catch (error: any) {
      console.error('❌ [Donation verifyDonation Error]:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error during donation verification.',
      });
    }
  },

  /**
   * GET /api/donations/my-donations
   * Returns all verified one-time donations made by the current user
   */
  async getMyDonations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const userId = user.id || user._id;

      const donations = await Donation.find({
        userId,
        status: 'paid',
      })
        .sort({ paidAt: -1, createdAt: -1 })
        .limit(20);

      const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

      res.status(200).json({
        success: true,
        donations: donations.map((d) => ({
          id: d._id.toString(),
          charityId: d.charityId,
          charityName: d.charityName,
          amount: d.amount,
          currency: d.currency,
          status: d.status,
          paidAt: d.paidAt,
          createdAt: d.createdAt,
          razorpayPaymentId: d.razorpayPaymentId,
        })),
        totalDonated,
      });
    } catch (error: any) {
      console.error('❌ [Donation getMyDonations Error]:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve donation history.',
      });
    }
  },
};
