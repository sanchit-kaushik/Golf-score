import crypto from 'crypto';

interface VerifyOrderSignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

interface VerifySubscriptionSignatureParams {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}

/**
 * Constant-time safe string comparison to protect against timing attacks
 */
const safeCompare = (a: string, b: string): boolean => {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

/**
 * Verifies standard Razorpay Order payment signature
 * payload: order_id + "|" + payment_id
 */
export const verifyRazorpayOrderSignature = (params: VerifyOrderSignatureParams): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) {
    console.error('❌ [Razorpay Verification] RAZORPAY_KEY_SECRET is not configured.');
    return false;
  }

  const { orderId, paymentId, signature } = params;
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return safeCompare(expectedSignature, signature);
};

/**
 * Verifies Razorpay Recurring Subscription payment signature
 * payload: payment_id + "|" + subscription_id
 */
export const verifyRazorpaySubscriptionSignature = (
  params: VerifySubscriptionSignatureParams
): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) {
    console.error('❌ [Razorpay Verification] RAZORPAY_KEY_SECRET is not configured.');
    return false;
  }

  const { subscriptionId, paymentId, signature } = params;
  if (!subscriptionId || !paymentId || !signature) {
    return false;
  }

  const payload = `${paymentId}|${subscriptionId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return safeCompare(expectedSignature, signature);
};

/**
 * Verifies incoming Razorpay Webhook signature
 */
export const verifyRazorpayWebhookSignature = (
  rawBody: string | Buffer,
  signatureHeader: string
): boolean => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signatureHeader) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return safeCompare(expectedSignature, signatureHeader);
};
