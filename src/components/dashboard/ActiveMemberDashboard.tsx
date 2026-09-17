import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Trophy,
  Calendar,
  Plus,
  Trash2,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Edit3,
  Lock,
  Unlock,
  Shuffle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJoin } from '../../context/JoinContext';
import { FEATURED_CHARITIES } from '../../data/content';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LogScoreModal } from './LogScoreModal';
import { ScoreTrendChart } from './ScoreTrendChart';
import { ChangeCharityModal } from './ChangeCharityModal';
import { LuckyNumberPickerModal } from './LuckyNumberPickerModal';
import { AdditionalDonationModal } from './AdditionalDonationModal';
import { api } from '../../lib/api';

interface ActiveMemberDashboardProps {
  isDemo?: boolean;
}

interface DrawCycleData {
  id: string;
  name: string;
  month: string;
  year: number;
  status: 'upcoming' | 'open' | 'locked' | 'published' | 'completed';
  isLocked: boolean;
  drawMethod: string;
  winningNumbers: number[];
  prizePool: number;
  jackpotRollover: boolean;
  jackpotAmount: number;
  lockDate: string;
  drawnAt?: string | null;
}

export const ActiveMemberDashboard: React.FC<ActiveMemberDashboardProps> = ({ isDemo = false }) => {
  const {
    user,
    scores,
    addScore,
    editScore,
    deleteScore,
    logout,
    selectedCharityId,
    charityPledgePercent,
    updateCharity,
    luckyNumbers: authLuckyNumbers,
  } = useAuth();
  const { selectedPlan } = useJoin();
  const navigate = useNavigate();

  // Modals state
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<any>(null);
  const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
  const [isLuckyPickerOpen, setIsLuckyPickerOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isStablefordInfoOpen, setIsStablefordInfoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Draw State from Server
  const [drawCycle, setDrawCycle] = useState<DrawCycleData>({
    id: 'default-cycle',
    name: 'September 2026 Monthly Draw',
    month: 'September',
    year: 2026,
    status: 'open',
    isLocked: false,
    drawMethod: 'random',
    winningNumbers: [7, 31, 46, 72, 88],
    prizePool: 100000,
    jackpotRollover: true,
    jackpotAmount: 40000,
    lockDate: new Date('2026-09-28T23:59:59.000Z').toISOString(),
  });

  const [userLuckyNumbers, setUserLuckyNumbers] = useState<number[]>(
    authLuckyNumbers && authLuckyNumbers.length === 5 ? authLuckyNumbers : [7, 28, 46, 71, 94]
  );
  const [isEntryLocked, setIsEntryLocked] = useState(false);
  const [isSimulatingDraw, setIsSimulatingDraw] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  // Fetch Current Draw Cycle & User Lucky Numbers from Backend
  const loadDrawData = async () => {
    try {
      const res = await api.draw.getCurrent();
      if (res.success && res.cycle) {
        setDrawCycle(res.cycle);
        if (res.userEntry && Array.isArray(res.userEntry.numbers) && res.userEntry.numbers.length === 5) {
          setUserLuckyNumbers(res.userEntry.numbers);
          setIsEntryLocked(res.userEntry.locked || res.cycle.isLocked);
        } else if (authLuckyNumbers && authLuckyNumbers.length === 5) {
          setUserLuckyNumbers(authLuckyNumbers);
        }
      }
    } catch (_err) {
      // Backend unavailable or demo fallback
    }
  };

  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [totalDonated, setTotalDonated] = useState<number>(0);

  const fetchMyDonations = async () => {
    try {
      const res = await api.donations.getMyDonations();
      if (res.success) {
        setMyDonations(res.donations || []);
        setTotalDonated(res.totalDonated || 0);
      }
    } catch (_err) {
      // Offline / fallback
    }
  };

  const [winningsSummary, setWinningsSummary] = useState<{
    totalWon: number;
    latestWinnings: any | null;
  }>({ totalWon: 0, latestWinnings: null });

  const fetchWinningsSummary = async () => {
    try {
      const res = await api.draw.getMyWinnings();
      if (res.success && res.winnings) {
        const winningItems = res.winnings.filter((w) => w.matchCount >= 3);
        setWinningsSummary({
          totalWon: res.totalWon || 0,
          latestWinnings: winningItems[0] || null,
        });
      }
    } catch (_err) {
      // Offline / fallback
    }
  };

  useEffect(() => {
    loadDrawData();
    fetchMyDonations();
    fetchWinningsSummary();
  }, [authLuckyNumbers, user]);

  // Active Charity calculation (in INR)
  const activeCharity =
    FEATURED_CHARITIES.find((c) => c.id === selectedCharityId) || FEATURED_CHARITIES[0];
  const planName = selectedPlan?.name || (user?.membershipPlanId === 'monthly' ? 'Monthly' : 'Yearly');
  const planPrice = selectedPlan?.price || (user?.membershipPlanId === 'monthly' ? 29 : 279);
  const planBilling = selectedPlan?.billingPeriod || (user?.membershipPlanId === 'monthly' ? 'month' : 'year');

  const monthlyBase = planBilling === 'year' ? planPrice / 12 : planPrice;
  const charityMonthlyAllocation = (monthlyBase * (charityPledgePercent / 100)).toFixed(2);

  // 1. GOLF PERFORMANCE METRICS (1–45)
  const scoreValues = scores.map((s) => s.score);
  const totalRounds = scores.length;
  const latestScore = totalRounds > 0 ? scores[0].score : null;
  const bestScore = totalRounds > 0 ? Math.max(...scoreValues) : null;
  const averageScore =
    totalRounds > 0
      ? (scoreValues.reduce((acc, curr) => acc + curr, 0) / totalRounds).toFixed(1)
      : null;

  // 2. LUCKY NUMBERS vs WINNING NUMBERS MATCHING
  // Strictly compares Lucky Numbers (1-99) vs Independent Winning Numbers (1-99)
  const activeWinningNumbers = drawCycle.winningNumbers.length === 5 ? drawCycle.winningNumbers : [7, 31, 46, 72, 88];
  const matchedNumbers = userLuckyNumbers.filter((num) => activeWinningNumbers.includes(num));
  const matchCount = matchedNumbers.length;

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openLogScoreModal = () => {
    setEditingScore(null);
    setIsScoreModalOpen(true);
  };

  const openEditScoreModal = (s: any) => {
    setEditingScore(s);
    setIsScoreModalOpen(true);
  };

  const handleScoreSubmit = async (
    score: number,
    date: string,
    courseName: string,
    editId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (editId) {
      return editScore(editId, score, date, courseName);
    } else {
      return addScore(score, date, courseName);
    }
  };

  const handleDeleteScore = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Stableford round score?')) {
      await deleteScore(id);
    }
  };

  // Save Lucky Numbers
  const handleSaveLuckyNumbers = async (numbers: number[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.draw.saveMyEntry(numbers);
      if (res.success) {
        setUserLuckyNumbers(numbers);
        setIsEntryLocked(res.entry.locked);
        return { success: true };
      }
      return { success: false, error: 'Failed to save numbers.' };
    } catch (err: any) {
      // Fallback for local / demo
      setUserLuckyNumbers(numbers);
      return { success: true };
    }
  };

  // Lock Lucky Numbers
  const handleLockLuckyNumbers = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.draw.lockMyEntry();
      if (res.success) {
        setIsEntryLocked(true);
        return { success: true };
      }
      return { success: false, error: 'Failed to lock numbers.' };
    } catch (err: any) {
      setIsEntryLocked(true);
      return { success: true };
    }
  };

  // Live Draw Simulation Trigger
  const handleSimulateLiveDraw = async () => {
    setIsSimulatingDraw(true);
    setSimulationNotice(null);
    try {
      const res = await api.draw.executeSimulation();
      if (res.success && res.drawCycle) {
        setDrawCycle((prev) => ({
          ...prev,
          winningNumbers: res.drawCycle.winningNumbers,
          status: 'completed',
          drawnAt: new Date().toISOString(),
        }));
        setSimulationNotice(
          `Independent draw completed! 5 winning numbers drawn: [${res.drawCycle.winningNumbers
            .map((n: number) => (n < 10 ? `0${n}` : n))
            .join(', ')}]`
        );
      }
    } catch (_err) {
      // Offline fallback: generate 5 unique numbers
      const generated = new Set<number>();
      while (generated.size < 5) {
        generated.add(Math.floor(Math.random() * 99) + 1);
      }
      const nums = Array.from(generated).sort((a, b) => a - b);
      setDrawCycle((prev) => ({
        ...prev,
        winningNumbers: nums,
        status: 'completed',
      }));
      setSimulationNotice(
        `Simulation: 5 independent winning numbers drawn: [${nums.map((n) => (n < 10 ? `0${n}` : n)).join(', ')}]`
      );
    } finally {
      setIsSimulatingDraw(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-charcoal flex flex-col selection:bg-sage-200 selection:text-sage-900">
      {/* ============================================================ */}
      {/* MEMBER NAVIGATION HEADER */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sand-200/90 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              <span className="font-serif italic font-normal text-base text-gold-400">D</span>
              <span className="font-sans font-bold text-[11px] -ml-0.5 text-white">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-extrabold tracking-widest text-sm text-charcoal leading-none">
                DIGITAL HEROES
              </span>
              <span className="text-[10px] tracking-wider uppercase text-charcoal-muted mt-0.5 font-medium">
                Member Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollToSection('monthly-journey')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-sand-100 transition-colors"
            >
              JOURNEY
            </button>
            <button
              onClick={() => scrollToSection('golf-performance')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-sand-100 transition-colors"
            >
              MY SCORES
            </button>
            <button
              onClick={() => scrollToSection('lucky-numbers')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-sand-100 transition-colors"
            >
              LUCKY NUMBERS
            </button>
            <button
              onClick={() => scrollToSection('monthly-draw')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-sand-100 transition-colors"
            >
              MONTHLY DRAW
            </button>
            <button
              onClick={() => scrollToSection('my-charity')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-sand-100 transition-colors"
            >
              MY CHARITY
            </button>
            <button
              onClick={() => scrollToSection('give-more')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
            >
              GIVE MORE
            </button>
            <button
              onClick={() => scrollToSection('membership-status')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-sand-100 transition-colors"
            >
              MEMBERSHIP
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-charcoal leading-none">
                {user?.fullName || 'Active Member'}
              </p>
              <p className="text-[10px] text-sage-800 font-mono font-medium mt-0.5">
                {user?.membershipMode === 'demo' ? 'Demo Access' : 'Verified Member'}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-charcoal-muted hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-charcoal hover:bg-sand-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-sand-200 bg-white p-4 space-y-2">
            <button
              onClick={() => scrollToSection('monthly-journey')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-charcoal hover:bg-sand-100 rounded-lg"
            >
              JOURNEY
            </button>
            <button
              onClick={() => scrollToSection('golf-performance')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-charcoal hover:bg-sand-100 rounded-lg"
            >
              MY SCORES
            </button>
            <button
              onClick={() => scrollToSection('lucky-numbers')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-charcoal hover:bg-sand-100 rounded-lg"
            >
              LUCKY NUMBERS
            </button>
            <button
              onClick={() => scrollToSection('monthly-draw')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-charcoal hover:bg-sand-100 rounded-lg"
            >
              MONTHLY DRAW
            </button>
            <button
              onClick={() => scrollToSection('my-charity')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-charcoal hover:bg-sand-100 rounded-lg"
            >
              MY CHARITY
            </button>
            <button
              onClick={() => scrollToSection('give-more')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg"
            >
              GIVE MORE
            </button>
            <button
              onClick={() => scrollToSection('membership-status')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-charcoal hover:bg-sand-100 rounded-lg"
            >
              MEMBERSHIP
            </button>
            <div className="pt-2 border-t border-sand-100 flex items-center justify-between">
              <span className="text-xs text-charcoal-muted">{user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* MAIN DASHBOARD CONTENT */}
      {/* ============================================================ */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-sand-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal tracking-tight">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Member'}.
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-charcoal-muted font-light">
              Your golf performance, lucky numbers, and charity allocation are verified and active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLuckyPickerOpen(true)}
              className="text-xs"
            >
              <Shuffle className="w-3.5 h-3.5 mr-1 text-sage-600" />
              <span>Choose Lucky Numbers</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsScoreModalOpen(true)}
              className="shadow-sm text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Log Round Score</span>
            </Button>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {isDemo && (
          <div className="mb-8 p-4 rounded-2xl bg-gold-50/80 border border-gold-200 text-xs text-charcoal flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-gold-800 uppercase tracking-wider text-[11px] font-mono mr-1">
                Demo Exploration Mode:
              </span>
              You are exploring the full subscriber dashboard in demo mode. All member functionality—logging Stableford scores, picking 1–99 Lucky Numbers, simulating the monthly draw, and customizing charity allocations—is fully active.
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOP 5 SUMMARY CARDS */}
        {/* ============================================================ */}
        <div
          id="membership-status"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10"
        >
          {/* Card 1: Membership */}
          <Card className="p-4 sm:p-5 bg-white border-sand-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-2">
              MEMBERSHIP
            </span>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-800 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-200 mb-1">
              <CheckCircle2 className="w-3 h-3 text-sage-600" />
              ACTIVE
            </div>
            <p className="text-xs text-charcoal-muted font-medium mt-1">{planName} Plan</p>
          </Card>

          {/* Card 2: ⛳ My Golf Scores */}
          <Card className="p-4 sm:p-5 bg-white border-sand-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-2">
              ⛳ MY GOLF SCORES
            </span>
            <div className="font-mono text-sm font-extrabold text-charcoal">
              {latestScore !== null ? `${latestScore} Stableford` : 'No Scores Yet'}
            </div>
            <p className="text-xs text-charcoal-muted font-medium mt-0.5">
              Score history: {scores.length} / 5 rounds
            </p>
            <button
              onClick={() => (scores.length > 0 ? scrollToSection('golf-performance') : openLogScoreModal())}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline mt-2 block"
            >
              {scores.length > 0 ? 'VIEW MY SCORES' : '+ ADD SCORE'}
            </button>
          </Card>

          {/* Card 3: 🎟️ MONTHLY DRAW */}
          <Card className="p-4 sm:p-5 bg-white border-sand-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-2">
              🎟️ MONTHLY DRAW
            </span>
            <div className="font-mono text-xs font-bold text-charcoal truncate">
              {userLuckyNumbers.length === 5
                ? userLuckyNumbers.map((n) => String(n).padStart(2, '0')).join(' ')
                : 'Not Selected'}
            </div>
            <p className="text-xs text-charcoal-muted font-medium mt-1">
              {drawCycle.status === 'published' || drawCycle.status === 'completed'
                ? `Matches: ${userLuckyNumbers.filter((n) => (drawCycle.winningNumbers || []).includes(n)).length} / 5`
                : isEntryLocked
                ? 'Status: ✓ Locked'
                : 'Status: Open to edit'}
            </p>
            <button
              onClick={() => navigate('/draw')}
              className="text-[10px] font-bold text-sage-800 hover:text-sage-950 underline mt-2 block"
            >
              VIEW DRAW →
            </button>
          </Card>

          {/* Card 4: 🏆 WINNINGS */}
          <Card className="p-4 sm:p-5 bg-white border-sand-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-2">
              🏆 WINNINGS
            </span>
            <div className="font-mono text-sm font-extrabold text-charcoal">
              ₹{winningsSummary.totalWon > 0
                ? winningsSummary.totalWon.toLocaleString('en-IN')
                : '0'}
            </div>
            <p className="text-xs text-charcoal-muted font-medium mt-0.5">
              Payment: {winningsSummary.latestWinnings?.paymentStatus === 'PAID'
                ? 'Paid'
                : winningsSummary.latestWinnings
                ? 'Pending'
                : 'None'}
            </p>
            <button
              onClick={() => navigate('/winnings')}
              className="text-[10px] font-bold text-gold-800 hover:text-gold-950 underline mt-2 block"
            >
              VIEW WINNINGS →
            </button>
          </Card>

          {/* Card 5: ❤️ MY CHARITY */}
          <Card className="p-4 sm:p-5 bg-white border-sand-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-2">
              ❤️ MY CHARITY
            </span>
            <div className="font-mono text-sm font-extrabold text-sage-800">
              ₹{charityMonthlyAllocation}/mo
            </div>
            <p className="text-xs text-charcoal-muted mt-1 truncate">
              {charityPledgePercent}% • {activeCharity.name}
            </p>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: YOUR MONTHLY JOURNEY (7 CLEAR STEPS) */}
        {/* ============================================================ */}
        <section id="monthly-journey" className="mb-12">
          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase font-bold text-sage-800 bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
              STEP-BY-STEP OVERVIEW
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal mt-2">
              Your Monthly Journey
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Follow these simple steps: Play golf, pick 5 Lucky Numbers, watch the draw, check your match, and give back.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
            {/* Step 01 */}
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between hover:border-sand-300 transition-all">
              <div>
                <span className="font-mono text-xs font-bold text-sage-700 block mb-1.5">01</span>
                <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-wider mb-1">
                  PLAY GOLF
                </h4>
                <p className="text-[11px] text-charcoal-muted leading-relaxed mb-3">
                  Enter your Stableford scores (1–45) from your rounds.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScoreModalOpen(true)}
                className="w-full text-[10px] font-bold justify-center"
              >
                LOG SCORE
              </Button>
            </div>

            {/* Step 02 */}
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between hover:border-sand-300 transition-all">
              <div>
                <span className="font-mono text-xs font-bold text-sage-700 block mb-1.5">02</span>
                <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-wider mb-1">
                  CHOOSE NUMBERS
                </h4>
                <p className="text-[11px] text-charcoal-muted leading-relaxed mb-3">
                  Pick 5 unique Lucky Numbers from 1–99.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLuckyPickerOpen(true)}
                className="w-full text-[10px] font-bold justify-center"
              >
                PICK 5 NUMBERS
              </Button>
            </div>

            {/* Step 03 */}
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between hover:border-sand-300 transition-all">
              <div>
                <span className="font-mono text-xs font-bold text-sage-700 block mb-1.5">03</span>
                <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-wider mb-1">
                  NUMBERS LOCK
                </h4>
                <p className="text-[11px] text-charcoal-muted leading-relaxed mb-3">
                  Your numbers lock before the monthly draw.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('lucky-numbers')}
                className="w-full text-[10px] font-bold justify-center"
              >
                {isEntryLocked ? 'LOCKED ✓' : 'LOCK STATUS'}
              </Button>
            </div>

            {/* Step 04 */}
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between hover:border-sand-300 transition-all">
              <div>
                <span className="font-mono text-xs font-bold text-sage-700 block mb-1.5">04</span>
                <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-wider mb-1">
                  MONTHLY DRAW
                </h4>
                <p className="text-[11px] text-charcoal-muted leading-relaxed mb-3">
                  5 independent winning numbers are drawn.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('monthly-draw')}
                className="w-full text-[10px] font-bold justify-center"
              >
                VIEW DRAW
              </Button>
            </div>

            {/* Step 05 */}
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between hover:border-sand-300 transition-all">
              <div>
                <span className="font-mono text-xs font-bold text-sage-700 block mb-1.5">05</span>
                <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-wider mb-1">
                  CHECK MATCH
                </h4>
                <p className="text-[11px] text-charcoal-muted leading-relaxed mb-3">
                  Compare your 5 Lucky Numbers with winning numbers.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('match-result')}
                className="w-full text-[10px] font-bold justify-center"
              >
                CHECK RESULT
              </Button>
            </div>

            {/* Step 06 */}
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between hover:border-sand-300 transition-all">
              <div>
                <span className="font-mono text-xs font-bold text-sage-700 block mb-1.5">06</span>
                <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-wider mb-1">
                  PRIZE POOL
                </h4>
                <p className="text-[11px] text-charcoal-muted leading-relaxed mb-3">
                  Win from 3, 4, or 5 match tiers (40% jackpot).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('prize-pool')}
                className="w-full text-[10px] font-bold justify-center"
              >
                PRIZE TIERS
              </Button>
            </div>

            {/* Step 07 */}
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between hover:border-sand-300 transition-all">
              <div>
                <span className="font-mono text-xs font-bold text-sage-700 block mb-1.5">07</span>
                <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-wider mb-1">
                  CHARITY
                </h4>
                <p className="text-[11px] text-charcoal-muted leading-relaxed mb-3">
                  Your membership allocates 10%–100% to your cause.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('my-charity')}
                className="w-full text-[10px] font-bold justify-center"
              >
                MY CAUSE
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* TWO COLUMN WORKSPACE: LEFT (GOLF PERFORMANCE), RIGHT (DRAW & CHARITY) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ============================================================ */}
          {/* LEFT COLUMN: GOLF PERFORMANCE (STEP 1) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-8">
            {/* SECTION 2: ⛳ MY GOLF SCORES */}
            <div
              id="golf-performance"
              className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⛳</span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
                      My Golf Scores
                    </h3>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Track your latest Stableford rounds.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={openLogScoreModal}
                    className="text-xs shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    + Log Round Score
                  </Button>
                </div>
              </div>

              {/* Beginner-friendly explanation: "What is a Stableford score?" */}
              <div className="mb-6 p-4 rounded-2xl bg-sand-50/90 border border-sand-200 text-xs">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setIsStablefordInfoOpen(!isStablefordInfoOpen)}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sage-700" />
                    <span className="font-bold text-charcoal">What is a Stableford score?</span>
                  </div>
                  <button className="text-charcoal-light hover:text-charcoal p-1">
                    {isStablefordInfoOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-charcoal-muted leading-relaxed mt-2">
                  Stableford is the scoring format used to record your golf performance here. Rather
                  than counting total strokes, Stableford awards points based on strokes taken at each
                  hole relative to par (e.g. 2 points for par, 3 points for birdie). Enter the score
                  you received for each round.
                </p>

                {isStablefordInfoOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 mt-3 border-t border-sand-200 text-charcoal-muted space-y-1.5 text-[11px]"
                  >
                    <p>• <strong>Score Range:</strong> 1–45 points per 18-hole round.</p>
                    <p>• <strong>One Per Date:</strong> Only one score is allowed per calendar date.</p>
                    <p>• <strong>Storage Rule:</strong> Only your 5 most recent scores are kept. Adding a newer score automatically replaces the oldest.</p>
                    <p className="text-emerald-800 font-semibold pt-1">
                      ⚠️ <strong>Important:</strong> Your golf scores reflect your real sports performance on the course. They are completely separate from your monthly lottery Lucky Numbers.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Score Count & Rolling Explanation Banner */}
              <div className="p-3.5 rounded-2xl bg-sand-50/90 border border-sand-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    {scores.length} / 5 scores recorded
                  </span>
                  <span className="text-charcoal font-medium">
                    {scores.length >= 5
                      ? "Your score history is full. Adding a new score will replace your oldest score."
                      : "Only your latest 5 Stableford scores are kept."}
                  </span>
                </div>
                <span className="text-[11px] text-charcoal-light">Newest first</span>
              </div>

              {/* Golf Performance Summary (AVERAGE, BEST, LATEST, TOTAL ROUNDS) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-1">
                    AVERAGE
                  </span>
                  <span className="font-mono text-xl font-extrabold text-charcoal">
                    {averageScore !== null ? `${averageScore}` : '—'}
                  </span>
                  <span className="text-[10px] text-charcoal-light block mt-0.5">points</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-1">
                    BEST
                  </span>
                  <span className="font-mono text-xl font-extrabold text-sage-800">
                    {bestScore !== null ? `${bestScore}` : '—'}
                  </span>
                  <span className="text-[10px] text-charcoal-light block mt-0.5">points</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-1">
                    LATEST
                  </span>
                  <span className="font-mono text-xl font-extrabold text-charcoal">
                    {latestScore !== null ? `${latestScore}` : '—'}
                  </span>
                  <span className="text-[10px] text-charcoal-light block mt-0.5">points</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-light block mb-1">
                    TOTAL ROUNDS
                  </span>
                  <span className="font-mono text-xl font-extrabold text-charcoal">
                    {totalRounds}
                  </span>
                  <span className="text-[10px] text-charcoal-light block mt-0.5">
                    {totalRounds >= 5 ? '5 in rotation' : `${totalRounds} logged`}
                  </span>
                </div>
              </div>

              {/* Golf Performance Trend Chart (if >= 2 scores) */}
              {totalRounds >= 2 && (
                <div className="mb-6">
                  <ScoreTrendChart scores={scores} />
                </div>
              )}

              {/* Latest 5 Rounds List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-mono text-xs uppercase font-bold text-charcoal-light tracking-wider">
                    YOUR LATEST 5 SCORES
                  </h4>
                  <span className="text-[11px] text-charcoal-light">Newest first</span>
                </div>

                {scores.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-sand-200 rounded-2xl">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                      <span className="text-2xl">⛳</span>
                    </div>
                    <h4 className="font-serif text-lg font-normal text-charcoal mb-1">
                      Start Your Score History
                    </h4>
                    <p className="text-xs text-charcoal-muted max-w-sm mx-auto mb-4">
                      Add your latest Stableford rounds to keep your golf profile up to date.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={openLogScoreModal}
                    >
                      + Add Your First Score
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-sand-100">
                    {scores.map((s, index) => (
                      <div
                        key={s.id}
                        className="py-3.5 flex items-center justify-between gap-3 text-xs group hover:bg-sand-50/50 px-2.5 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-sand-100 text-charcoal font-mono font-bold flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-bold text-charcoal text-sm">
                              {s.courseName || 'Verified Course Round'}
                            </p>
                            <p className="text-[11px] text-charcoal-light flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {s.date} • <span className="font-medium text-emerald-800">Stableford</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-mono text-base font-extrabold text-charcoal">
                              {s.score}
                            </span>
                            <span className="text-[10px] text-charcoal-light block">pts</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditScoreModal(s)}
                              className="text-sand-500 hover:text-charcoal hover:bg-sand-100 transition-colors p-1.5 rounded-lg"
                              title="Edit Score"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteScore(s.id)}
                              className="text-sand-400 hover:text-red-600 hover:bg-red-50 transition-colors p-1.5 rounded-lg"
                              title="Delete Score"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Supporting Rules Footer */}
              <div className="mt-6 pt-4 border-t border-sand-100 text-[11px] text-charcoal-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>Score range: 1–45 points</span>
                <span>Only your 5 most recent scores are kept. Oldest automatically replaced.</span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 3: 🎟️ YOUR LUCKY NUMBERS (STEP 2 & 3) */}
            {/* ============================================================ */}
            <div
              id="lucky-numbers"
              className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎟️</span>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-sage-800 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                      STEP 2 · MONTHLY LUCKY NUMBERS
                    </span>
                    <h3 className="font-serif text-2xl font-normal text-charcoal mt-1">
                      Your Lucky Numbers
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEntryLocked ? (
                    <Badge variant="gold" className="text-[10px] font-mono font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      NUMBERS LOCKED
                    </Badge>
                  ) : (
                    <Badge variant="sage" className="text-[10px] font-mono font-bold flex items-center gap-1">
                      <Unlock className="w-3 h-3 text-sage-600" />
                      NUMBERS OPEN
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Your 5 numbers for the <strong>{drawCycle.month} {drawCycle.year} Draw</strong>. Picked from 1–99.
                </p>
                <span className="text-[11px] font-mono text-charcoal-light shrink-0">
                  Cycle: {drawCycle.month} {drawCycle.year}
                </span>
              </div>

              {/* 5 Distinct Lucky Numbers Grid (1–99) */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-4 mb-5">
                {userLuckyNumbers.map((num, i) => {
                  const isMatch = activeWinningNumbers.includes(num);
                  return (
                    <div
                      key={i}
                      className={`p-3 sm:p-4 rounded-2xl border text-center shadow-subtle flex flex-col justify-center items-center transition-all ${
                        isMatch
                          ? 'bg-sage-50 border-sage-500 ring-2 ring-sage-300'
                          : 'bg-sand-50/80 border-sand-200'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase text-charcoal-light font-bold mb-0.5">
                        LUCKY 0{i + 1}
                      </span>
                      <span
                        className={`font-mono text-2xl sm:text-3xl font-extrabold ${
                          isMatch ? 'text-sage-800' : 'text-charcoal'
                        }`}
                      >
                        {num < 10 ? `0${num}` : num}
                      </span>
                      {isMatch && (
                        <span className="text-[9px] font-bold text-sage-800 mt-1 uppercase">
                          MATCH!
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status & Actions Row */}
              <div className="p-4 rounded-2xl bg-sand-50/90 border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="text-xs">
                  {isEntryLocked ? (
                    <p className="text-amber-900 font-medium">
                      🔒 <strong>Locked:</strong> Your Lucky Numbers are locked for this month's draw.
                    </p>
                  ) : (
                    <p className="text-charcoal-muted">
                      ✏️ <strong>Editable:</strong> You can modify your numbers anytime before the draw locks.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isEntryLocked}
                    onClick={() => setIsLuckyPickerOpen(true)}
                    className="text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    <span>{isEntryLocked ? 'Selection Locked' : 'Choose / Edit Numbers'}</span>
                  </Button>
                </div>
              </div>

              {/* Critical Product Distinction Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <span className="font-bold text-amber-700">📌 RULE:</span>
                <div>
                  <strong>Lucky Numbers are NOT your golf scores.</strong> Stableford scores (1–45) track your golf handicap on the course. These 5 Lucky Numbers (1–99) are selected by you for the monthly lottery draw.
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: DRAW, MATCHING, PRIZE POOL & CHARITY */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-8">
            {/* ============================================================ */}
            {/* SECTION 4: 🎰 STEP 3 · MONTHLY DRAW */}
            {/* ============================================================ */}
            <div
              id="monthly-draw"
              className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-gold-700 bg-gold-50 px-2.5 py-0.5 rounded border border-gold-200">
                    STEP 4 · INDEPENDENT DRAW
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-charcoal mt-1">
                    {drawCycle.month} {drawCycle.year} Winning Numbers
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
                  <Clock className="w-3.5 h-3.5 text-sage-600" />
                  <span>
                    {drawCycle.status === 'completed' ? 'Draw Completed' : '12 days left'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                5 numbers from 1–99 are drawn independently. Winning numbers are completely separate from member scores.
              </p>

              {/* 5 Winning Numbers Grid */}
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-5">
                {activeWinningNumbers.map((num, i) => {
                  const isUserMatch = userLuckyNumbers.includes(num);
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-center shadow-subtle flex flex-col justify-center items-center ${
                        isUserMatch
                          ? 'bg-gold-50 border-gold-400 ring-2 ring-gold-200'
                          : 'bg-sand-50 border-sand-200'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase text-charcoal-light font-bold mb-0.5">
                        DRAWN
                      </span>
                      <span
                        className={`font-mono text-xl sm:text-2xl font-extrabold ${
                          isUserMatch ? 'text-gold-700' : 'text-charcoal'
                        }`}
                      >
                        {num < 10 ? `0${num}` : num}
                      </span>
                      {isUserMatch && (
                        <span className="text-[8px] font-bold text-gold-800 mt-0.5 uppercase">
                          MATCH!
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Live Draw Simulation Action for Testing/Auditing */}
              <div className="p-3.5 rounded-2xl bg-sand-50/90 border border-sand-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-4">
                <div>
                  <span className="font-bold text-charcoal block">Auditable Independent Draw:</span>
                  <span className="text-charcoal-muted text-[11px]">
                    Method: {drawCycle.drawMethod === 'random' ? 'Standard Random Lottery' : 'Algorithmic Weighted'}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateLiveDraw}
                  disabled={isSimulatingDraw}
                  className="text-[11px] font-bold shrink-0"
                >
                  <Shuffle className="w-3 h-3 mr-1 text-gold-600" />
                  <span>{isSimulatingDraw ? 'Drawing...' : 'Simulate Independent Draw'}</span>
                </Button>
              </div>

              {simulationNotice && (
                <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-800 mb-4">
                  {simulationNotice}
                </div>
              )}

              {/* ============================================================ */}
              {/* SECTION 5: 🎯 SHOW THE MATCHING PROCESS */}
              {/* ============================================================ */}
              <div id="match-result" className="pt-4 border-t border-sand-100">
                <h4 className="font-mono text-xs uppercase font-bold text-charcoal-light tracking-wider mb-3">
                  HOW YOUR DRAW WORKS
                </h4>

                <div className="p-4 rounded-2xl bg-sand-50/90 border border-sand-200 text-xs space-y-3">
                  {/* Step A: Lucky Numbers */}
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block mb-1">
                      YOUR 5 LUCKY NUMBERS:
                    </span>
                    <span className="font-mono font-bold text-charcoal text-sm">
                      {userLuckyNumbers.map((n) => (n < 10 ? `0${n}` : n)).join(' • ')}
                    </span>
                  </div>

                  <div className="text-charcoal-light text-xs">↓ compared against</div>

                  {/* Step B: Winning Numbers */}
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block mb-1">
                      MONTHLY WINNING NUMBERS:
                    </span>
                    <span className="font-mono font-bold text-charcoal text-sm">
                      {activeWinningNumbers.map((n) => (n < 10 ? `0${n}` : n)).join(' • ')}
                    </span>
                  </div>

                  <div className="text-charcoal-light text-xs">↓ matching result</div>

                  {/* Step C: Match Result */}
                  <div className="pt-2 border-t border-sand-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block">
                        YOUR MATCH RESULT:
                      </span>
                      <span className="font-mono font-extrabold text-sm text-charcoal">
                        {matchCount} {matchCount === 1 ? 'MATCH' : 'MATCHES'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block">
                        PRIZE STATUS:
                      </span>
                      <span
                        className={`font-bold text-xs ${
                          matchCount >= 3 ? 'text-gold-700 font-extrabold' : 'text-charcoal-muted'
                        }`}
                      >
                        {matchCount === 5
                          ? '5-NUMBER MATCH JACKPOT!'
                          : matchCount === 4
                          ? '4-NUMBER MATCH QUALIFIED!'
                          : matchCount === 3
                          ? '3-NUMBER MATCH QUALIFIED!'
                          : 'No prize tier yet (3 needed)'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-charcoal-muted mt-2 text-center">
                  "3 matches are needed to qualify for a prize tier."
                </p>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 6: 🏆 HOW THE PRIZE POOL WORKS */}
            {/* ============================================================ */}
            <div
              id="prize-pool"
              className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase font-bold text-gold-700 bg-gold-50 px-2.5 py-0.5 rounded border border-gold-200">
                  STEP 6 · PRIZE POOL ALLOCATION
                </span>
                <Trophy className="w-4 h-4 text-gold-500" />
              </div>

              <h3 className="font-serif text-2xl font-normal text-charcoal mb-2">
                How the Prize Pool Works
              </h3>

              <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                Prize pool allocations follow the official PRD distribution. Multiple subscribers can select the same numbers; matching winners in each tier share that tier's prize equally.
              </p>

              <div className="space-y-3 mb-5">
                {/* 5-Number Match */}
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal">5-NUMBER MATCH</span>
                    <p className="text-[11px] text-charcoal-muted">Grand jackpot tier</p>
                    <p className="text-[10px] text-charcoal-light">
                      Rolls over to next month if unclaimed.
                    </p>
                  </div>
                  <span className="font-mono font-extrabold text-charcoal text-sm text-right">
                    40% OF POOL
                  </span>
                </div>

                {/* 4-Number Match */}
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal">4-NUMBER MATCH</span>
                    <p className="text-[10px] text-charcoal-muted">
                      Shared equally among qualifying winners. No rollover.
                    </p>
                  </div>
                  <span className="font-mono font-extrabold text-charcoal text-sm text-right">
                    35% OF POOL
                  </span>
                </div>

                {/* 3-Number Match */}
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal">3-NUMBER MATCH</span>
                    <p className="text-[10px] text-charcoal-muted">
                      Shared equally among qualifying winners. No rollover.
                    </p>
                  </div>
                  <span className="font-mono font-extrabold text-charcoal text-sm text-right">
                    25% OF POOL
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 7: ❤️ YOUR CHOSEN CHARITY (MEMBERSHIP ALLOCATION) */}
            {/* ============================================================ */}
            <div
              id="my-charity"
              className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase font-bold text-sage-800 bg-sage-50 px-2.5 py-0.5 rounded border border-sage-200">
                  STEP 7 · MEMBERSHIP GIVING
                </span>
                <Heart className="w-4 h-4 text-sage-600 fill-sage-600" />
              </div>

              <h3 className="font-serif text-2xl font-normal text-charcoal mb-4">
                ❤️ Your Chosen Charity
              </h3>

              {/* Charity Image & Details */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={activeCharity.imageUrl}
                  alt={activeCharity.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-sand-200 shadow-sm shrink-0"
                />
                <div>
                  <Badge variant="sage" className="text-[9px] font-mono py-0 px-2 mb-1">
                    {activeCharity.category}
                  </Badge>
                  <h4 className="font-bold text-base text-charcoal">{activeCharity.name}</h4>
                  <p className="text-xs text-charcoal-muted line-clamp-2">{activeCharity.summary}</p>
                </div>
              </div>

              {/* Contribution Breakdown in INR */}
              <div className="p-4 rounded-2xl bg-sage-50/70 border border-sage-200/80 mb-5 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-muted">Membership Pledge Ratio:</span>
                  <span className="font-mono font-bold text-sage-800">
                    {charityPledgePercent}% OF SUBSCRIPTION
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-sage-200/60 pt-2">
                  <span className="text-charcoal-muted">Monthly Allocation:</span>
                  <span className="font-mono font-bold text-charcoal text-sm">
                    ₹{charityMonthlyAllocation} / month allocated to your selected cause
                  </span>
                </div>
              </div>

              {/* Interactive Charity Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCharityModalOpen(true)}
                  className="w-full justify-center text-xs"
                >
                  <Heart className="w-3.5 h-3.5 mr-1.5 text-sage-600" />
                  <span>VIEW MY CHARITY</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCharityModalOpen(true)}
                  className="w-full justify-center text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  <span>CHANGE CHARITY</span>
                </Button>
              </div>

              <div className="mt-4 pt-3 border-t border-sand-100 flex items-center gap-1.5 text-[10px] text-charcoal-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
                <span>Authoritative allocation tracked to your selected cause.</span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 8: 💚 ADDITIONAL DONATIONS */}
            {/* ============================================================ */}
            <div
              id="give-more"
              className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  INDEPENDENT GIVING
                </span>
                <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </div>

              <h3 className="font-serif text-2xl font-normal text-charcoal mb-2">
                💚 Additional Donations
              </h3>

              {myDonations.length > 0 ? (
                <div className="space-y-4 mb-1">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-muted font-medium">Total donated:</span>
                      <span className="font-mono font-extrabold text-emerald-900 text-base">
                        ₹{totalDonated}
                      </span>
                    </div>

                    <div className="border-t border-emerald-200/80 pt-2 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal-muted">Recent donation:</span>
                        <span className="font-bold text-charcoal">
                          ₹{myDonations[0].amount} → {myDonations[0].charityName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal-muted">Status:</span>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                          Paid
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Voluntary contribution independent from membership and draw mechanics.
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDonationModalOpen(true)}
                    className="w-full justify-center text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    <Heart className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    <span>MAKE AN ADDITIONAL DONATION</span>
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                    Support a cause beyond your membership allocation. Make an additional contribution to a verified cause you care about.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 text-xs text-charcoal-muted mb-5 space-y-1.5">
                    <p>• <strong>Independent:</strong> Does not affect your golf scores or Stableford handicap.</p>
                    <p>• <strong>Draw Neutral:</strong> Does not alter Lucky Numbers or prize tier eligibility.</p>
                    <p>• <strong>Direct Support:</strong> 100% voluntary philanthropic contribution.</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDonationModalOpen(true)}
                    className="w-full justify-center text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    <Heart className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    <span>MAKE A DONATION</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}
      {/* Log Score Modal */}
      <LogScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => {
          setIsScoreModalOpen(false);
          setEditingScore(null);
        }}
        onSubmit={handleScoreSubmit}
        editItem={editingScore}
        currentCount={scores.length}
      />

      {/* Change / View Charity Modal */}
      <ChangeCharityModal
        isOpen={isCharityModalOpen}
        onClose={() => setIsCharityModalOpen(false)}
        currentCharityId={selectedCharityId}
        currentPledgePercent={charityPledgePercent}
        planPrice={planPrice}
        planBilling={planBilling}
        onSave={updateCharity}
      />

      {/* Lucky Number 1–99 Picker Modal */}
      <LuckyNumberPickerModal
        isOpen={isLuckyPickerOpen}
        onClose={() => setIsLuckyPickerOpen(false)}
        currentNumbers={userLuckyNumbers}
        isLocked={isEntryLocked}
        drawMonth={drawCycle.month}
        drawYear={drawCycle.year}
        onSave={handleSaveLuckyNumbers}
        onLock={handleLockLuckyNumbers}
      />

      {/* Additional Donation Modal */}
      <AdditionalDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        currentCharityId={selectedCharityId}
        onDonationSuccess={() => {
          fetchMyDonations();
        }}
      />
    </div>
  );
};
