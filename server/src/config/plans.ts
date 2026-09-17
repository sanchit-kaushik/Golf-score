export interface ServerPlanConfig {
  id: 'monthly' | 'yearly';
  name: string;
  tagline: string;
  amount: number; // In smallest currency unit (paise for INR, cents for USD)
  displayPrice: number;
  currency: string;
  billingPeriod: 'month' | 'year';
  intervalDays: number;
  razorpayPlanId?: string;
}

export const getPlanConfig = (planId: 'monthly' | 'yearly'): ServerPlanConfig | null => {
  const currency = (process.env.RAZORPAY_CURRENCY || 'INR').toUpperCase();
  
  // Amounts in smallest currency unit (e.g. 2900 paise = ₹29.00 or $29.00)
  const plans: Record<'monthly' | 'yearly', ServerPlanConfig> = {
    monthly: {
      id: 'monthly',
      name: 'Digital Heroes Monthly Membership',
      tagline: 'Flexible access to monthly draws and verified scoring',
      amount: process.env.RAZORPAY_MONTHLY_AMOUNT ? parseInt(process.env.RAZORPAY_MONTHLY_AMOUNT, 10) : 2900,
      displayPrice: 29,
      currency,
      billingPeriod: 'month',
      intervalDays: 30,
      razorpayPlanId: process.env.RAZORPAY_MONTHLY_PLAN_ID || undefined,
    },
    yearly: {
      id: 'yearly',
      name: 'Digital Heroes Annual Membership',
      tagline: 'Year-round participation with maximum value and impact',
      amount: process.env.RAZORPAY_YEARLY_AMOUNT ? parseInt(process.env.RAZORPAY_YEARLY_AMOUNT, 10) : 27900,
      displayPrice: 279,
      currency,
      billingPeriod: 'year',
      intervalDays: 365,
      razorpayPlanId: process.env.RAZORPAY_YEARLY_PLAN_ID || undefined,
    },
  };

  return plans[planId] || null;
};
