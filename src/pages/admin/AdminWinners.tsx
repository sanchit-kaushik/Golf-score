import React, { useEffect, useState } from 'react';
import { RefreshCw, Loader2, CheckCircle2, ExternalLink, CreditCard, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

interface WinnerRecord {
  _id: string;
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  drawCycleId?: {
    _id: string;
    name: string;
    month: string;
    year: number;
  };
  luckyNumbers: number[];
  winningNumbers: number[];
  matchCount: number;
  prizeAmount: number;
  verificationStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus: 'NOT_WINNER' | 'PENDING' | 'PAID';
  proofUrl?: string;
  adminNote?: string;
  createdAt: string;
}

export const AdminWinners: React.FC = () => {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchWinners = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.admin.getWinners();
      if (res.success && Array.isArray(res.winners)) {
        setWinners(res.winners);
      } else {
        setErrorMsg('Failed to load winners records.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error fetching winners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      setErrorMsg(null);
      const res = await api.admin.updateWinnerVerification(id, 'APPROVED', 'Verified by Administrator');
      if (res.success) {
        setSuccessMsg('Winner verification APPROVED.');
        setWinners((prev) =>
          prev.map((w) => (w._id === id ? { ...w, verificationStatus: 'APPROVED' } : w))
        );
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectNote('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    try {
      setActionLoading(rejectingId);
      setErrorMsg(null);
      const res = await api.admin.updateWinnerVerification(
        rejectingId,
        'REJECTED',
        rejectNote || 'Proof did not match tournament requirements.'
      );
      if (res.success) {
        setSuccessMsg('Winner verification REJECTED.');
        setWinners((prev) =>
          prev.map((w) =>
            w._id === rejectingId
              ? { ...w, verificationStatus: 'REJECTED', adminNote: rejectNote }
              : w
          )
        );
        setRejectingId(null);
        setRejectNote('');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!window.confirm('Confirm that this prize has been physically disbursed and mark payment as PAID?')) {
      return;
    }

    try {
      setActionLoading(id);
      setErrorMsg(null);
      const res = await api.admin.markWinnerPayout(id);
      if (res.success) {
        setSuccessMsg('Payout status updated to PAID.');
        setWinners((prev) =>
          prev.map((w) => (w._id === id ? { ...w, paymentStatus: 'PAID' } : w))
        );
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Payout mark failed.');
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
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">Winner Verification & Payouts</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Review draw winners, audit uploaded scorecard proof, and record disbursements
            </p>
          </div>
          <button
            onClick={fetchWinners}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Winners Table */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-stone-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Draw</th>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Lucky Numbers</th>
                  <th className="py-3 px-4 font-semibold">Winning Numbers</th>
                  <th className="py-3 px-4 font-semibold">Matches</th>
                  <th className="py-3 px-4 font-semibold">Prize</th>
                  <th className="py-3 px-4 font-semibold">Proof</th>
                  <th className="py-3 px-4 font-semibold">Verification</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {loading && winners.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-stone-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1B3022]" />
                        <span>Loading winners from MongoDB...</span>
                      </div>
                    </td>
                  </tr>
                ) : winners.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-stone-400">
                      No winning entries found in published draws.
                    </td>
                  </tr>
                ) : (
                  winners.map((w) => {
                    const isBusy = actionLoading === w._id;
                    const drawName = w.drawCycleId?.name || 'September 2026';
                    const userName = w.userId?.fullName || 'Member Golfer';
                    const luckyNums = w.luckyNumbers?.map((n) => n.toString().padStart(2, '0')).join(' ') || '—';
                    const winNums = w.winningNumbers?.map((n) => n.toString().padStart(2, '0')).join(' ') || '—';

                    return (
                      <tr key={w._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-stone-800">{drawName}</td>
                        <td className="py-3 px-4 font-bold text-[#1B3022]">{userName}</td>
                        <td className="py-3 px-4 font-mono text-stone-700 bg-stone-50/50">{luckyNums}</td>
                        <td className="py-3 px-4 font-mono text-amber-800 font-semibold">{winNums}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1B3022]">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                            {w.matchCount} / 5
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-700 font-mono">
                          ₹{w.prizeAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {w.proofUrl ? (
                            <a
                              href={w.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
                            >
                              <span>VIEW PROOF</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              w.verificationStatus === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : w.verificationStatus === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : w.verificationStatus === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {w.verificationStatus}
                          </span>
                          {w.adminNote && (
                            <p className="text-[9px] text-stone-500 italic mt-0.5 line-clamp-1">
                              {w.adminNote}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              w.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {w.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {w.verificationStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(w._id)}
                                  disabled={isBusy}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold tracking-wider uppercase transition-colors"
                                >
                                  APPROVE
                                </button>
                                <button
                                  onClick={() => handleOpenRejectModal(w._id)}
                                  disabled={isBusy}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold tracking-wider uppercase transition-colors"
                                >
                                  REJECT
                                </button>
                              </>
                            )}

                            {w.paymentStatus !== 'PAID' && (
                              <button
                                onClick={() => handleMarkAsPaid(w._id)}
                                disabled={isBusy}
                                className="px-2.5 py-1 bg-[#1B3022] hover:bg-[#2C4C38] text-[#D4AF37] rounded text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1"
                              >
                                <CreditCard className="w-2.5 h-2.5" />
                                <span>MARK AS PAID</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reject Note Modal */}
        {rejectingId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-stone-900">Provide Rejection Reason</h3>
              <p className="text-xs text-stone-600">
                Enter an administrative note explaining why this proof or round does not satisfy verification requirements:
              </p>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Scorecard date did not match draw window."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectingId(null)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWinners;
