export interface NavItem {
  label: string;
  href: string;
}

export interface IdeaStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export interface DrawStep {
  number: string;
  title: string;
  description: string;
  highlight?: string;
}

export interface PrizeTier {
  matchCount: string;
  percentage: number;
  description: string;
  tierName: string;
  rolloverInfo?: string;
}

export interface CharityCause {
  id: string;
  name: string;
  category: string;
  summary: string;
  impactMetric: string;
  imageUrl: string;
  tag: string;
}

export interface MembershipPlan {
  id: 'monthly' | 'yearly';
  name: string;
  tagline: string;
  price: number;
  currency: string;
  billingPeriod: 'month' | 'year';
  billing?: 'month' | 'year';
  monthlyEquivalent?: number;
  discount?: string;
  badge?: string;
  billingDescription: string;
  description: string;
  features: string[];
}

export type MembershipStatus = 'none' | 'pending' | 'active' | 'cancelled' | 'expired';
export type MembershipMode = 'none' | 'real' | 'demo';

export interface GolfScore {
  id: string;
  score: number; // Stableford score 1-45
  date: string; // YYYY-MM-DD
  courseName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role?: 'user' | 'admin';
  membershipStatus: MembershipStatus;
  membershipMode: MembershipMode;
  isMembershipActive: boolean;
  membershipPlanId?: 'monthly' | 'yearly' | null;
  selectedCharityId?: string;
  selectedCharity?: string;
  charityPledgePercent?: number;
  charityContributionPercentage?: number;
  luckyNumbers?: number[];
  createdAt: string;
}

export interface JoinAccountForm {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface JoinFlowState {
  selectedPlanId: 'monthly' | 'yearly' | null;
  account: JoinAccountForm;
}
