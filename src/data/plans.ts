import type { MembershipPlan } from '../types';

/**
 * Golf-Hero Membership Plans Configuration
 * 
 * Note: These are demo prices and configurations.
 * Values can easily be updated here or fed from a backend API when Razorpay is integrated.
 */
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    tagline: 'Flexible access to monthly draws and verified scoring',
    price: 29,
    currency: '$',
    billingPeriod: 'month',
    billing: 'month',
    billingDescription: 'Billed monthly. Cancel anytime without penalty.',
    description: 'Perfect for golfers looking for flexible, month-to-month access to performance tracking and community prize draws.',
    features: [
      'Log your latest 5 Stableford scores (range 1–45)',
      'Direct monthly entry into 5-number, 4-number, and 3-number draw tiers',
      'Minimum 10% subscription pledge allocated to your selected charity',
      'Personal player dashboard with active round history',
      'Automated draw notification and winner proof verification access'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly',
    tagline: 'Year-round participation with maximum value and impact',
    price: 279,
    currency: '$',
    billingPeriod: 'year',
    billing: 'year',
    monthlyEquivalent: 23.25,
    discount: 'Save 20% (approx. 2 months free)',
    badge: 'BEST VALUE',
    billingDescription: 'Billed annually at ₹279/yr (₹23.25/mo equivalent).',
    description: 'Our most popular tier. Enjoy uninterrupted entry into all 12 monthly draws plus sustained philanthropic contribution to your charity.',
    features: [
      'Log your latest 5 Stableford scores (range 1–45)',
      'Guaranteed entry into all 12 monthly number draws',
      'Continuous eligibility for rolling 5-number rollover jackpot pools',
      'Minimum 10% subscription pledge allocated to your selected charity',
      'Comprehensive player dashboard with deep scoring trends & statistics',
      'Priority winner proof verification & expedited payout processing'
    ]
  }
];

export const MEMBERSHIP_BENEFITS = [
  {
    title: 'Golf score tracking',
    description: 'Record verified Stableford scores (1–45) from your rounds. Golf-Hero maintains your latest 5 scores in active rotation.'
  },
  {
    title: 'Monthly draw participation',
    description: 'Your verified score numbers automatically qualify you for the monthly number draw across 5, 4, and 3-number match tiers.'
  },
  {
    title: 'Charity contribution',
    description: 'Direct a minimum 10% of your subscription fee to a chosen grassroots or certified charitable cause, with option to voluntarily boost.'
  },
  {
    title: 'Participation tracking',
    description: 'Audit live active draw numbers, verify round eligibility timestamps, and review historical cycle records.'
  },
  {
    title: 'Winnings tracking',
    description: 'Track prize pool distributions, submit scorecard proof for verification, and review tier payouts.'
  }
];
