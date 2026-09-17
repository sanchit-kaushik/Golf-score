import Razorpay from 'razorpay';

export const isRazorpayReady = (): boolean => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  return Boolean(
    keyId &&
    keySecret &&
    keyId.trim() !== '' &&
    keySecret.trim() !== '' &&
    !keyId.includes('<') && // not a template placeholder
    !keySecret.includes('<')
  );
};

export const getRazorpayClient = (): Razorpay | null => {
  if (!isRazorpayReady()) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET!.trim(),
  });
};

export const getRazorpayKeyId = (): string | null => {
  if (!isRazorpayReady()) {
    return null;
  }
  return process.env.RAZORPAY_KEY_ID!.trim();
};
