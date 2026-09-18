import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Trophy,
  Users,
  Award,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

interface TierAllocation {
  name: string;
  percentage: string;
  pool: number;
  winners: number;
  perWinner: number;
  rollover: boolean;
}

interface MatchingParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  luckyNumbers: number[];
  matchedNumbers: number[];
  matchCount: number;
  tier: string;
  prizeAmount: number;
  paymentStatus?: string;
  verificationStatus?: string;
}

export const AdminDraws: React.FC = () => {
  const [cycle, setCycle] = useState<any>(null);
  const [matchingParticipants, setMatchingParticipants] = useState<MatchingParticipant[]>([]);
  const [tierAllocations, setTierAllocations] = useState<{
    '5-match': TierAllocation;
    '4-match': TierAllocation;
    '3-match': TierAllocation;
  } | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [demoRunNumber, setDemoRunNumber] = useState<number>(1);
  const [lastExecutedAt, setLastExecutedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterView, setFilterView] = useState<'all' | 'winners'>('all');

  const fetchCurrentDraw = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.draw.getCurrent();
      if (res.success && res.cycle) {
        setCycle(res.cycle);
        if (res.totalParticipants !== undefined) {
          setTotalParticipants(res.totalParticipants);
        }
        if (res.matchingParticipants) {
          setMatchingParticipants(res.matchingParticipants);
        }
        if (res.tierAllocations) {
          setTierAllocations(res.tierAllocations as any);
        }
        if (res.demoRunNumber) {
          setDemoRunNumber(res.demoRunNumber);
        }
        if (res.cycle.drawnAt) {
          setLastExecutedAt(new Date(res.cycle.drawnAt).toLocaleTimeString());
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to retrieve current draw status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentDraw();
  }, []);

  const handleOpenDemoModal = () => {
    setShowDemoModal(true);
  };

  const handleConfirmDraw = async () => {
    setShowDemoModal(false);
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await api.admin.executeDraw();
      if (res.success) {
        if (res.drawCycle) setCycle(res.drawCycle);
        if (res.winningNumbers && cycle) {
          setCycle((prev: any) => ({
            ...prev,
            ...res.drawCycle,
            winningNumbers: res.winningNumbers,
          }));
        }
        if (res.matchingParticipants) {
          setMatchingParticipants(res.matchingParticipants);
        }
        if (res.tierAllocations) {
          setTierAllocations(res.tierAllocations as any);
        }
        if (res.totalParticipants !== undefined) {
          setTotalParticipants(res.totalParticipants);
        }
        if (res.demoRunNumber) {
          setDemoRunNumber(res.demoRunNumber);
        }
        setLastExecutedAt(new Date().toLocaleTimeString());
        setSuccessMsg(
          `Draw executed successfully in Demo Mode (Run #${res.demoRunNumber})! Winning numbers and matching results updated across ${res.totalParticipants} member entries.`
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to execute draw.');
    } finally {
      setActionLoading(false);
    }
  };

  const hasDrawn = Boolean(cycle?.winningNumbers && cycle.winningNumbers.length === 5);
  const winningNumbersList: number[] = cycle?.winningNumbers || [];

  const winningParticipants = matchingParticipants.filter((p) => p.matchCount >= 3);
  const displayedParticipants =
    filterView === 'winners' ? winningParticipants : matchingParticipants;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">Monthly Lucky Draw</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Official Monthly Draw management with interactive Demo Mode for project evaluation
            </p>
          </div>
          <button
            onClick={fetchCurrentDraw}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-700 hover:text-red-900 text-xs font-bold px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SINGLE UNIFIED SECTION: MONTHLY LUCKY DRAW                                */}
        {/* ========================================================================= */}
        <div className="bg-white border-2 border-[#1B3022]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 relative overflow-hidden">
          {/* Top Bar with Badge and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h2 className="text-xl font-extrabold text-[#1B3022] tracking-tight">
                  MONTHLY LUCKY DRAW
                </h2>
                {/* Evaluator Demo Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono text-[11px] font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  DEMO MODE • REPEATABLE FOR EVALUATION
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Single unified lucky draw system. Demo draws update the live monthly cycle and re-evaluate all member entries in real time.
              </p>
            </div>

            {/* Draw Status Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono text-stone-500">Draw Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-mono tracking-wider ${
                  hasDrawn
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {hasDrawn ? 'PUBLISHED (DEMO)' : cycle?.status || 'OPEN'}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Current Month
              </span>
              <div className="text-base sm:text-lg font-bold text-[#1B3022]">
                {cycle ? `${cycle.month} ${cycle.year}` : 'September 2026'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Prize Pool
              </span>
              <div className="text-base sm:text-lg font-bold text-amber-700 font-mono">
                ₹{(cycle?.prizePool || 100000).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Eligible Participants
              </span>
              <div className="text-base sm:text-lg font-bold text-[#1B3022] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stone-400" />
                <span>{totalParticipants} Members</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Execution Mode
              </span>
              <div className="text-base sm:text-lg font-bold text-amber-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Demo (Repeatable)</span>
              </div>
            </div>
          </div>

          {/* Winning Numbers Block */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 font-mono block">
                  Current Winning Numbers (1–99)
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  5 cryptographically selected independent winning integers
                </p>
              </div>
              {hasDrawn && lastExecutedAt && (
                <span className="text-[11px] font-mono text-stone-500">
                  Drawn at {lastExecutedAt} (Run #{demoRunNumber})
                </span>
              )}
            </div>

            {hasDrawn && winningNumbersList.length === 5 ? (
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap pt-1">
                {winningNumbersList.map((num, idx) => (
                  <div
                    key={idx}
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1B3022] to-[#2C4C38] text-[#D4AF37] border-2 border-[#D4AF37]/50 flex items-center justify-center font-mono font-extrabold text-xl sm:text-2xl shadow-md transform hover:scale-105 transition-transform"
                  >
                    {num.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white border border-dashed border-stone-300 text-center text-xs text-stone-500 font-mono space-y-1">
                <p className="font-semibold text-stone-700">Winning numbers have not yet been drawn for this cycle.</p>
                <p className="text-[11px] text-stone-400">Click &apos;RUN DRAW&apos; below to generate numbers and match member entries.</p>
              </div>
            )}

            {/* Main Action Button */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-200">
              <span className="text-[11px] text-stone-500 italic">
                * Click triggers Demo Mode confirmation before executing.
              </span>

              <button
                onClick={handleOpenDemoModal}
                disabled={actionLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1B3022] to-[#2C4C38] hover:from-[#2C4C38] hover:to-[#1B3022] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md active:scale-98 border border-[#D4AF37]/40 cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    <span>Evaluating Draw & Matching Members...</span>
                  </>
                ) : hasDrawn ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                    <span>RUN DRAW AGAIN</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>SIMULATE DRAW</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DRAW RESULTS: TIERS & PARTICIPANT MATCHING                                 */}
          {/* ========================================================================= */}
          {hasDrawn && (
            <div className="space-y-6 pt-2">
              {/* Demo Result Notice Banner */}
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 font-mono tracking-wide block">
                      DEMO RESULT — NOT AN OFFICIAL PRODUCTION RESULT
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Execution #{demoRunNumber} • Evaluated across {totalParticipants} member entries in real-time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleOpenDemoModal}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300/80 text-amber-900 font-bold text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-run Draw</span>
                </button>
              </div>

              {/* Tier Breakdown Cards */}
              {tierAllocations && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-mono mb-3">
                    Prize Pool Allocation by PRD Tier
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    {/* 5-Match Tier */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1B3022] flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-600" />
                          5-Match Tier (40%)
                        </span>
                        {tierAllocations['5-match'].rollover ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono text-[10px] font-bold border border-amber-200">
                            ROLLOVER = YES
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">
                            AWARDED
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-bold text-amber-700 font-mono">
                        ₹{tierAllocations['5-match'].pool.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-stone-600 flex justify-between border-t border-stone-200 pt-2 font-mono">
                        <span>Winners: {tierAllocations['5-match'].winners}</span>
                        <span>Split: ₹{tierAllocations['5-match'].perWinner.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 4-Match Tier */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1B3022]">4-Match Tier (35%)</span>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded font-mono text-[10px]">
                          NO ROLLOVER
                        </span>
                      </div>
                      <div className="text-xl font-bold text-[#1B3022] font-mono">
                        ₹{tierAllocations['4-match'].pool.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-stone-600 flex justify-between border-t border-stone-200 pt-2 font-mono">
                        <span>Winners: {tierAllocations['4-match'].winners}</span>
                        <span>Split: ₹{tierAllocations['4-match'].perWinner.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 3-Match Tier */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1B3022]">3-Match Tier (25%)</span>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded font-mono text-[10px]">
                          NO ROLLOVER
                        </span>
                      </div>
                      <div className="text-xl font-bold text-[#1B3022] font-mono">
                        ₹{tierAllocations['3-match'].pool.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-stone-600 flex justify-between border-t border-stone-200 pt-2 font-mono">
                        <span>Winners: {tierAllocations['3-match'].winners}</span>
                        <span>Split: ₹{tierAllocations['3-match'].perWinner.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Participant & Matching Results Table */}
              <div className="rounded-2xl border border-[#E5E0D8] overflow-hidden bg-white shadow-xs">
                {/* Table Filter / Controls Header */}
                <div className="px-5 py-3.5 bg-stone-100/70 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-stone-800 font-mono uppercase text-[11px] tracking-wider">
                      Participant Entries & Match Evaluation ({matchingParticipants.length} Total Entries)
                    </h4>
                    <p className="text-[10px] text-stone-500 font-mono">
                      Each member&apos;s 5 Lucky Numbers matched against current winning numbers
                    </p>
                  </div>

                  {/* Filter View Toggle */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 self-start sm:self-auto font-mono text-[11px]">
                    <button
                      onClick={() => setFilterView('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        filterView === 'all'
                          ? 'bg-[#1B3022] text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      All Entries ({matchingParticipants.length})
                    </button>
                    <button
                      onClick={() => setFilterView('winners')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        filterView === 'winners'
                          ? 'bg-[#1B3022] text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Qualifying Winners ({winningParticipants.length})
                    </button>
                  </div>
                </div>

                {displayedParticipants.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500">
                    {filterView === 'winners'
                      ? 'No member matched 3, 4, or 5 numbers in this draw run. Click "RUN DRAW AGAIN" to test another draw outcome.'
                      : 'No participant entries found for this monthly cycle.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-mono text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Member</th>
                          <th className="py-3 px-4">Chosen Lucky Numbers</th>
                          <th className="py-3 px-4">Matched Numbers</th>
                          <th className="py-3 px-4">Matches</th>
                          <th className="py-3 px-4">Prize Tier</th>
                          <th className="py-3 px-4 text-right">Prize Won</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {displayedParticipants.map((p, idx) => {
                          const isWinner = p.matchCount >= 3;
                          return (
                            <tr
                              key={p.userId || idx}
                              className={`transition-colors ${
                                isWinner
                                  ? 'bg-amber-50/40 hover:bg-amber-100/50 font-medium'
                                  : 'hover:bg-stone-50'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="font-semibold text-stone-900">{p.userName}</div>
                                <div className="text-[10px] text-stone-400 font-mono">{p.userEmail}</div>
                              </td>

                              {/* Chosen Lucky Numbers (highlight matches) */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 font-mono">
                                  {p.luckyNumbers.map((num, nIdx) => {
                                    const isMatch = winningNumbersList.includes(num);
                                    return (
                                      <span
                                        key={nIdx}
                                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                          isMatch
                                            ? 'bg-amber-200 text-amber-900 border border-amber-400 shadow-xs'
                                            : 'bg-stone-100 text-stone-600'
                                        }`}
                                      >
                                        {num.toString().padStart(2, '0')}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* Matched Numbers */}
                              <td className="py-3 px-4 font-mono">
                                {p.matchedNumbers.length > 0 ? (
                                  <span className="font-bold text-amber-800">
                                    {p.matchedNumbers
                                      .map((n) => n.toString().padStart(2, '0'))
                                      .join(' ')}
                                  </span>
                                ) : (
                                  <span className="text-stone-400 text-[11px]">None</span>
                                )}
                              </td>

                              {/* Match Count Badge */}
                              <td className="py-3 px-4 font-mono">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    p.matchCount === 5
                                      ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                                      : p.matchCount === 4
                                      ? 'bg-amber-200 text-amber-900 border border-amber-400'
                                      : p.matchCount === 3
                                      ? 'bg-yellow-200 text-yellow-900 border border-yellow-400'
                                      : 'bg-stone-100 text-stone-500'
                                  }`}
                                >
                                  {p.matchCount} / 5
                                </span>
                              </td>

                              {/* Prize Tier */}
                              <td className="py-3 px-4 font-mono text-[11px]">
                                {p.tier !== 'none' ? (
                                  <span className="font-bold uppercase text-amber-800">
                                    {p.tier}
                                  </span>
                                ) : (
                                  <span className="text-stone-400">No Prize</span>
                                )}
                              </td>

                              {/* Prize Won */}
                              <td className="py-3 px-4 text-right font-mono font-bold">
                                {p.prizeAmount > 0 ? (
                                  <span className="text-emerald-700 text-sm">
                                    ₹{p.prizeAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-stone-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Repeat Control */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-500 font-mono">
                  Current Draw Run #{demoRunNumber} • Repeatable at any time
                </span>
                <button
                  onClick={handleOpenDemoModal}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1B3022] hover:bg-[#2C4C38] text-[#D4AF37] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors border border-[#D4AF37]/30 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>RUN DRAW AGAIN</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CONFIRMATION MODAL (EXACT SPECIFICATION)                                  */}
        {/* ========================================================================= */}
        {showDemoModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#E5E0D8] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-stone-900 font-sans">
                  ⚠️ DEMO MODE
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  This draw is being executed in DEMO MODE for project demonstration.
                  Demo draws can be performed multiple times and do not represent the official monthly draw.
                </p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  In the real production system, the official Lucky Draw is conducted only once per month.
                </p>
                <p className="text-xs font-semibold text-stone-800 pt-1">
                  Continue with Demo Draw?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDraw}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B3022] hover:bg-[#2C4C38] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  RUN DEMO DRAW
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDraws;

