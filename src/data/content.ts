import type { IdeaStep, DrawStep, PrizeTier, CharityCause } from '../types';

export const IDEA_STEPS: IdeaStep[] = [
  {
    step: "01",
    title: "PLAY",
    subtitle: "Your Game on the Course",
    description: "Head out to any registered course and play your regular game. Record your latest Stableford scores directly on the platform.",
    iconName: "Target",
  },
  {
    step: "02",
    title: "CHANCE",
    subtitle: "The Monthly Draw",
    description: "Every verified round seamlessly qualifies you for the monthly number draw, giving your regular weekend round a thrill beyond the scorecard.",
    iconName: "Sparkles",
  },
  {
    step: "03",
    title: "IMPACT",
    subtitle: "Giving Back with Every Swing",
    description: "Select a charitable cause close to your heart. A minimum 10% of your subscription is directed directly to your chosen initiative.",
    iconName: "HeartHandshake",
  },
];

export const DRAW_STEPS: DrawStep[] = [
  {
    number: "01",
    title: "BECOME A MEMBER",
    description: "Join the Digital Heroes community and set your personal giving preference.",
    highlight: "Simple onboarding"
  },
  {
    number: "02",
    title: "ENTER YOUR SCORES",
    description: "Log your verified Stableford scores (1–45) from your rounds. We retain your latest 5 scores.",
    highlight: "Latest 5 scores active"
  },
  {
    number: "03",
    title: "JOIN THE MONTHLY DRAW",
    description: "Your verified scores qualify your membership for entry into the monthly random or algorithmic draw.",
    highlight: "Zero extra hassle"
  },
  {
    number: "04",
    title: "MATCH NUMBERS",
    description: "Our verified, auditable draw selects winning numbers across 5-number, 4-number, and 3-number tiers.",
    highlight: "Transparent mechanics"
  },
  {
    number: "05",
    title: "WIN & CELEBRATE",
    description: "Match your numbers to claim your prize tier allocation, split equally among matching winners.",
    highlight: "Rollover protection"
  }
];

export const PRIZE_TIERS: PrizeTier[] = [
  {
    matchCount: "5-NUMBER MATCH",
    percentage: 40,
    tierName: "The Grand Tier",
    description: "Match all 5 numbers drawn in the monthly cycle. Unclaimed funds roll over directly to the next month's pool.",
    rolloverInfo: "Jackpot rolls over to the next month if unclaimed"
  },
  {
    matchCount: "4-NUMBER MATCH",
    percentage: 35,
    tierName: "The Master Tier",
    description: "Match 4 numbers out of 5 drawn. Distributed evenly among all verified qualifying members in this tier.",
    rolloverInfo: "Equally divided among qualifying winners"
  },
  {
    matchCount: "3-NUMBER MATCH",
    percentage: 25,
    tierName: "The Club Tier",
    description: "Match 3 numbers out of 5 drawn. Broadest winner tier ensuring regular celebratory moments for members.",
    rolloverInfo: "Equally divided among qualifying winners"
  }
];

export const FEATURED_CHARITIES: CharityCause[] = [
  {
    id: "youth-golf",
    name: "Youth Horizons in Sport",
    category: "Youth Empowerment",
    summary: "Providing equipment, coaching, and educational mentorship to underprivileged youth through the discipline of golf.",
    impactMetric: "Representative partner cause dedicated to athletic accessibility and youth mentorship.",
    imageUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=900&q=80",
    tag: "Youth Development"
  },
  {
    id: "green-conservation",
    name: "Open Fairways Parkland Trust",
    category: "Environmental Stewardship",
    summary: "Preserving local biodiversity, native woodlands, and freshwater wetlands situated around historic golf corridors.",
    impactMetric: "Focused on eco-friendly turf management and pollinator habitat restoration across green spaces.",
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=80",
    tag: "Ecology & Land"
  },
  {
    id: "accessible-athletics",
    name: "Adaptive Greens Initiative",
    category: "Adaptive Athletics",
    summary: "Creating custom adaptive mobility carts and specialized coaching clinics for injured veterans and athletes with disabilities.",
    impactMetric: "Empowering disabled golfers to return to the sport they cherish with dignity and tailored support.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=900&q=80",
    tag: "Adaptive Sports"
  }
];
