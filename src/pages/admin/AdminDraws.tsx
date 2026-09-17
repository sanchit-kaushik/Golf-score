import React, { useEffect, useState } from 'react';
import { Lock, Unlock, Play, Sparkles, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

export const AdminDraws: React.FC = () => {
  const [cycle, setCycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [simulatedNumbers, setSimulatedNumbers] = useState<number[] | null>(null);
  const [simulationPreview, setSimulationPreview] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCurrentDraw = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.draw.getCurrent();
      if (res.success && res.cycle) {
        setCycle(res.cycle);
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

  const handleGenerateWinningNumbers = async () => {
    try {
      setActionLoading('generate');
      setErrorMsg(null);
      const res = await api.admin.generateWinningNumbers();
      if (res.success && res.winningNumbers) {
        setSuccessMsg(`Generated winning numbers: ${res.winningNumbers.map((n: number) => n.toString().padStart(2, '0')).join(' ')}`);
        fetchCurrentDraw();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate numbers.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLockDraw = async () => {
    try {
      setActionLoading('lock');
      setErrorMsg(null);
      const res = await api.admin.lockDraw();
      if (res.success) {
        setSuccessMsg('Draw has been LOCKED. No further lucky number selections allowed.');
        fetchCurrentDraw();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to lock draw.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDraw = async () => {
    try {
      setActionLoading('open');
      setErrorMsg(null);
      const res = await api.admin.openDraw();
      if (res.success) {
        setSuccessMsg('Draw cycle is now OPEN for member number entries.');
        fetchCurrentDraw();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to open draw.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishResults = async () => {
    if (!window.confirm('Are you sure you want to PUBLISH official results? This will evaluate all member lucky numbers, award tier prizes, and create winner records in MongoDB.')) {
      return;
    }

    try {
      setActionLoading('publish');
      setErrorMsg(null);
      const res = await api.admin.publishDraw();
      if (res.success) {
        setSuccessMsg('Results published successfully! Winners evaluated and prizes awarded.');
        fetchCurrentDraw();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to publish draw results.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateDraw = async () => {
    try {
      setActionLoading('simulate');
      setErrorMsg(null);
      const res = await api.admin.simulateDraw();
      if (res.success) {
        setSimulatedNumbers(res.simulatedNumbers);
        setSimulationPreview(res.previewStats);
        setSuccessMsg('Draw simulated successfully! Preview numbers generated (No DB changes made).');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Simulation error.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">Monthly Draw Management</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Control the official monthly lucky draw lifecycle & run instant simulations
            </p>
          </div>
          <button
            onClick={fetchCurrentDraw}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CURRENT DRAW CARD */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">
                ACTIVE CYCLE
              </span>
              <h2 className="text-xl font-extrabold text-[#1B3022]">CURRENT DRAW</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-500">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-mono tracking-wider ${
                  cycle?.status === 'published'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : cycle?.status === 'locked'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {cycle?.status || 'OPEN'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[11px] font-mono text-stone-500 uppercase">Draw Month</span>
              <div className="text-lg font-bold text-[#1B3022]">
                {cycle ? `${cycle.month} ${cycle.year}` : 'September 2026'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[11px] font-mono text-stone-500 uppercase">Total Prize Pool</span>
              <div className="text-lg font-bold text-amber-700">
                ₹{(cycle?.prizePool || 100000).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Winning Numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                Official Winning Numbers:
              </label>
              <span className="text-[11px] text-stone-500 font-mono">5 Numbers (1–99)</span>
            </div>

            {cycle?.winningNumbers && cycle.winningNumbers.length > 0 ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {cycle.winningNumbers.map((num: number, idx: number) => (
                  <div
                    key={idx}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1B3022] text-[#D4AF37] border-2 border-[#2C4C38] flex items-center justify-center font-mono font-bold text-lg sm:text-xl shadow-md"
                  >
                    {num.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-xs text-stone-500 font-mono">
                Winning numbers have not yet been drawn for this cycle.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3">
            <button
              onClick={handleGenerateWinningNumbers}
              disabled={actionLoading !== null}
              className="px-4 py-2.5 rounded-xl bg-[#2C4C38] hover:bg-[#1B3022] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {actionLoading === 'generate' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>GENERATE DRAW</span>
            </button>

            {cycle?.status === 'open' ? (
              <button
                onClick={handleLockDraw}
                disabled={actionLoading !== null}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {actionLoading === 'lock' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>LOCK DRAW</span>
              </button>
            ) : (
              <button
                onClick={handleOpenDraw}
                disabled={actionLoading !== null}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {actionLoading === 'open' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                <span>OPEN DRAW</span>
              </button>
            )}

            <button
              onClick={handlePublishResults}
              disabled={actionLoading !== null}
              className="px-4 py-2.5 rounded-xl bg-[#1B3022] hover:bg-[#2C4C38] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm border border-[#D4AF37]/40 disabled:opacity-50"
            >
              {actionLoading === 'publish' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>PUBLISH RESULTS</span>
            </button>
          </div>
        </div>

        {/* DRAW SIMULATION CARD */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono">
                NON-DESTRUCTIVE PREVIEW
              </span>
              <h2 className="text-lg font-bold text-[#1B3022]">DRAW SIMULATION</h2>
            </div>
            <button
              onClick={handleSimulateDraw}
              disabled={actionLoading !== null}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 self-start sm:self-auto"
            >
              {actionLoading === 'simulate' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>SIMULATE DRAW</span>
            </button>
          </div>

          <p className="text-xs text-stone-600">
            Generate an instant dry-run preview of 5 independent winning numbers. This preview checks match counts across current active member entries without altering the real published state.
          </p>

          {simulatedNumbers && (
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
                  Generated Numbers:
                </span>
                <div className="flex items-center gap-2 sm:gap-3 mt-2">
                  {simulatedNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-600 text-white font-mono font-bold text-base sm:text-lg flex items-center justify-center shadow-sm"
                    >
                      {num.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {simulationPreview && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-200/60 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200">
                    <span className="text-[10px] font-mono text-stone-500">Evaluated Entries</span>
                    <div className="font-bold text-stone-800">{simulationPreview.entriesCount}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200">
                    <span className="text-[10px] font-mono text-stone-500">5-Match (Jackpot)</span>
                    <div className="font-bold text-amber-700">{simulationPreview.match5}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200">
                    <span className="text-[10px] font-mono text-stone-500">4-Match Winners</span>
                    <div className="font-bold text-stone-800">{simulationPreview.match4}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200">
                    <span className="text-[10px] font-mono text-stone-500">3-Match Winners</span>
                    <div className="font-bold text-stone-800">{simulationPreview.match3}</div>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-amber-800 italic">
                * This is a preview only. Simulation does NOT modify the real published result.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDraws;
