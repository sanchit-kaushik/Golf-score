import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Lock,
  Unlock,
  Trophy,
  HelpCircle,
  Play,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LuckyNumberPickerModal } from '../components/dashboard/LuckyNumberPickerModal';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const DrawPage: React.FC = () => {
  const navigate = useNavigate();
  const { luckyNumbers: authLuckyNumbers, isAuthenticated, isLoading, membershipStatus } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (membershipStatus !== 'active') {
        navigate('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, membershipStatus, navigate]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const [drawCycle, setDrawCycle] = useState<any>({
    name: 'September 2026 Monthly Draw',
    month: 'September',
    year: 2026,
    status: 'open',
    isLocked: false,
    winningNumbers: [7, 18, 42, 63, 94],
    prizePool: 100000,
    jackpotRollover: true,
    jackpotAmount: 40000,
  });

  const [userEntry, setUserEntry] = useState<{
    numbers: number[];
    locked: boolean;
  } | null>(null);

  const [userResult, setUserResult] = useState<{
    matchCount: number;
    matchedNumbers: number[];
    prizeTier: string;
    prizeAmount: number;
    paymentStatus: string;
    verificationStatus: string;
  } | null>(null);

  const loadDrawData = async () => {
    try {
      const res = await api.draw.getCurrent();
      if (res.success && res.cycle) {
        setDrawCycle(res.cycle);
        if (res.userEntry && Array.isArray(res.userEntry.numbers)) {
          setUserEntry({
            numbers: res.userEntry.numbers,
            locked: res.userEntry.locked,
          });
        } else if (authLuckyNumbers && authLuckyNumbers.length === 5) {
          setUserEntry({
            numbers: authLuckyNumbers,
            locked: false,
          });
        }
        if (res.userResult) {
          setUserResult({
            matchCount: res.userResult.matchCount,
            matchedNumbers: res.userResult.matchedNumbers,
            prizeTier: res.userResult.prizeTier,
            prizeAmount: res.userResult.prizeAmount,
            paymentStatus: res.userResult.paymentStatus || 'NOT_WINNER',
            verificationStatus: res.userResult.verificationStatus || 'NONE',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching draw details:', err);
    }
  };

  useEffect(() => {
    loadDrawData();
  }, [authLuckyNumbers]);

  const handleSaveNumbers = async (numbers: number[]) => {
    try {
      const res = await api.draw.saveMyEntry(numbers);
      if (res.success) {
        setUserEntry({
          numbers: res.entry.numbers,
          locked: res.entry.locked,
        });
        await loadDrawData();
        return { success: true };
      }
      return { success: false, error: 'Failed to save Lucky Numbers.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to save numbers.' };
    }
  };

  const handleLockNumbers = async () => {
    try {
      const res = await api.draw.lockMyEntry();
      if (res.success) {
        setUserEntry((prev) => (prev ? { ...prev, locked: true } : null));
        await loadDrawData();
        return { success: true };
      }
      return { success: false, error: 'Failed to lock Lucky Numbers.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to lock numbers.' };
    }
  };

  const handleExecuteDraw = async () => {
    setIsExecuting(true);
    try {
      const res = await api.draw.executeDraw();
      if (res.success) {
        await loadDrawData();
      }
    } catch (err) {
      console.error('Error running draw:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const userNumbers = userEntry?.numbers || [];
  const isLocked = Boolean(userEntry?.locked || drawCycle.isLocked);
  const isPublished = drawCycle.status === 'published' || drawCycle.status === 'completed';

  // Compute live match if result not yet fetched from server
  const winningNumbers: number[] = drawCycle.winningNumbers || [];
  const liveMatches = userNumbers.filter((n) => winningNumbers.includes(n));
  const matchCount = userResult?.matchCount ?? (isPublished ? liveMatches.length : 0);

  return (
    <div className="min-h-screen bg-sand-50/50 flex flex-col font-sans text-charcoal">
      {/* Header Bar */}
      <header className="bg-white border-b border-sand-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-charcoal hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO DASHBOARD</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="font-serif font-bold text-sm tracking-tight text-charcoal">
              GOLF-HERO
            </span>
            <Badge variant="sage" className="text-[10px] font-mono py-0.5">
              MONTHLY DRAW
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-sage-800 bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
              FEATURE 1 · INDEPENDENT MONTHLY DRAW
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal mt-2">
              Monthly Draw
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              {drawCycle.month} {drawCycle.year} · Exactly 5 Lucky Numbers (1–99).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : isLocked
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-sand-100 text-charcoal border-sand-200'
              }`}
            >
              {isPublished ? '● PUBLISHED' : isLocked ? '● LOCKED' : '● OPEN'}
            </span>

            {/* Quick Draw Simulation Button (Admin / Test Mode) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExecuteDraw}
              disabled={isExecuting}
              className="text-xs font-bold border-gold-300 bg-gold-50/50 hover:bg-gold-100 text-gold-900"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 text-gold-600 fill-gold-600" />
              {isExecuting ? 'Running Draw...' : 'Generate / Draw Numbers'}
            </Button>
          </div>
        </div>

        {/* Section 1: User's Lucky Numbers */}
        <Card className="p-6 sm:p-8 bg-white border-sand-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-sand-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block mb-1">
                STEP 1: YOUR ENTRY
              </span>
              <h3 className="font-serif text-2xl font-normal text-charcoal">
                Your Lucky Numbers
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                  isLocked
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isLocked ? '✓ Locked' : 'Open to edit'}
              </span>

              {!isLocked && userNumbers.length === 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLockNumbers}
                  className="text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-50"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  Lock Entry
                </Button>
              )}
            </div>
          </div>

          {userNumbers.length === 5 ? (
            <div className="space-y-6">
              {/* Ball display */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 py-3">
                {userNumbers.map((num) => {
                  const isHit = isPublished && winningNumbers.includes(num);
                  return (
                    <motion.div
                      key={num}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono text-xl sm:text-2xl font-extrabold shadow-sm transition-all ${
                        isHit
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ring-4 ring-emerald-200 shadow-elevated scale-105'
                          : 'bg-sand-100 text-charcoal border border-sand-300'
                      }`}
                    >
                      <span>{String(num).padStart(2, '0')}</span>
                      {isHit && (
                        <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-emerald-100 mt-0.5">
                          MATCH
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {!isLocked && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-charcoal-muted">
                    Need to change your selection? Edit your numbers before the draw closes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPickerOpen(true)}
                    className="text-xs font-bold"
                  >
                    Change Numbers
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-sand-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-sand-100 text-charcoal-muted flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-sage-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-charcoal">No Lucky Numbers Chosen</h4>
                <p className="text-xs text-charcoal-muted max-w-sm mx-auto mt-1">
                  Pick 5 numbers from 1–99 to enter this month's draw.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsPickerOpen(true)}
                className="font-bold text-xs"
              >
                CHOOSE LUCKY NUMBERS
              </Button>
            </div>
          )}
        </Card>

        {/* Section 2: Winning Numbers & Match Result */}
        <Card className="p-6 sm:p-8 bg-white border-sand-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-sand-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block mb-1">
                STEP 2: OFFICIAL RESULTS
              </span>
              <h3 className="font-serif text-2xl font-normal text-charcoal">
                Winning Numbers
              </h3>
            </div>

            {isPublished && (
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-gold-50 text-gold-900 border border-gold-200">
                <Trophy className="w-3.5 h-3.5 text-gold-600" />
                <span>YOUR MATCH: {matchCount} / 5</span>
              </div>
            )}
          </div>

          {isPublished ? (
            <div className="space-y-6">
              {/* Winning balls */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 py-2">
                {winningNumbers.map((num) => (
                  <div
                    key={num}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-charcoal font-mono text-xl sm:text-2xl font-extrabold flex flex-col items-center justify-center shadow-md border border-gold-300"
                  >
                    <span>{String(num).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>

              {/* Match outcome banner */}
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  matchCount >= 3
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-sand-50 border-sand-200 text-charcoal-muted'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {matchCount >= 3
                        ? `🎉 Congratulations! You matched ${matchCount} of 5 numbers!`
                        : `You matched ${matchCount} of 5 numbers.`}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px]">
                    {matchCount >= 3
                      ? `You qualify for the ${
                          matchCount === 5
                            ? 'Grand 5-Match Tier (40% Jackpot)'
                            : matchCount === 4
                            ? 'Master 4-Match Tier (35% Pool)'
                            : 'Club 3-Match Tier (25% Pool)'
                        }. Visit My Winnings to submit verification.`
                      : 'Match 3, 4, or 5 numbers to win from the prize pool. Better luck in the next monthly draw!'}
                  </p>
                </div>

                {matchCount >= 3 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/winnings')}
                    className="shrink-0 font-bold text-xs"
                  >
                    VIEW WINNINGS
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-2xl bg-sand-100 text-charcoal-light flex items-center justify-center font-mono text-xl font-bold border border-dashed border-sand-300"
                  >
                    ?
                  </div>
                ))}
              </div>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                Winning numbers are generated independently at the conclusion of the monthly cycle.
                Locked Lucky Numbers will automatically be matched against the winning draw.
              </p>
            </div>
          )}
        </Card>

        {/* Section 3: Prize Pool Breakdown & Rollover Rules */}
        <Card className="p-6 sm:p-8 bg-white border-sand-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light">
              PRIZE ALLOCATION RULES
            </span>
            <span className="font-mono text-xs font-bold text-sage-800">
              TOTAL POOL: ₹{drawCycle.prizePool.toLocaleString('en-IN')}
            </span>
          </div>

          <h3 className="font-serif text-2xl font-normal text-charcoal mb-4">
            Prize Pool Structure
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* 5-Match Tier */}
            <div className="p-4 rounded-2xl bg-gold-50/80 border border-gold-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-gold-900">5 MATCHES</span>
                <span className="text-[10px] font-mono font-bold text-gold-800 bg-gold-100 px-1.5 py-0.5 rounded">
                  40% POOL
                </span>
              </div>
              <p className="font-serif text-lg font-bold text-charcoal">Jackpot Tier</p>
              <div className="mt-2 text-[11px] text-charcoal-muted space-y-0.5">
                <p>• Split equally among 5-match winners.</p>
                <p className="text-gold-900 font-semibold">
                  • <strong>Rollover: YES.</strong> Rolls over to next month if unclaimed.
                </p>
              </div>
            </div>

            {/* 4-Match Tier */}
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-charcoal">4 MATCHES</span>
                <span className="text-[10px] font-mono font-bold text-charcoal bg-sand-200 px-1.5 py-0.5 rounded">
                  35% POOL
                </span>
              </div>
              <p className="font-serif text-lg font-bold text-charcoal">Master Tier</p>
              <div className="mt-2 text-[11px] text-charcoal-muted space-y-0.5">
                <p>• Split equally among 4-match winners.</p>
                <p>• Rollover: NO.</p>
              </div>
            </div>

            {/* 3-Match Tier */}
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-charcoal">3 MATCHES</span>
                <span className="text-[10px] font-mono font-bold text-charcoal bg-sand-200 px-1.5 py-0.5 rounded">
                  25% POOL
                </span>
              </div>
              <p className="font-serif text-lg font-bold text-charcoal">Club Tier</p>
              <div className="mt-2 text-[11px] text-charcoal-muted space-y-0.5">
                <p>• Split equally among 3-match winners.</p>
                <p>• Rollover: NO.</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs text-charcoal-muted flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-sage-600 mt-0.5 shrink-0" />
            <div>
              <strong>Strict Separation of Concerns:</strong> Stableford golf scores track course performance only.
              The monthly draw operates solely on 1–99 Lucky Numbers. Golf scores are never used as lottery numbers.
            </div>
          </div>
        </Card>
      </main>

      {/* Lucky Number Picker Modal */}
      <LuckyNumberPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentNumbers={userNumbers}
        isLocked={isLocked}
        drawMonth={drawCycle.month}
        drawYear={drawCycle.year}
        onSave={handleSaveNumbers}
        onLock={handleLockNumbers}
      />
    </div>
  );
};
