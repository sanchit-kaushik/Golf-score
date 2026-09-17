import React, { useEffect, useState } from 'react';
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

interface DonationRecord {
  _id: string;
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  charityId: string;
  charityName: string;
  amount: number;
  currency: string;
  status: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export const AdminDonations: React.FC = () => {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.admin.getDonations();
      if (res.success && Array.isArray(res.donations)) {
        setDonations(res.donations);
        setTotalAmount(res.totalAmount || 0);
      } else {
        setErrorMsg('Failed to load donations.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error fetching donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">Independent Donations</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Voluntary one-time donor contributions processed via Razorpay Test Mode
            </p>
          </div>
          <button
            onClick={fetchDonations}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Total Donations Highlight Card */}
        <div className="bg-gradient-to-br from-[#1B3022] to-[#2C4C38] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] font-mono">
              TOTAL DONATIONS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              ₹{totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-stone-300 mt-1 font-sans">
              Recorded independent gifts directly benefiting partner non-profits
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono self-start sm:self-auto">
            <span>{donations.length} total contributions</span>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-stone-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Charity</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Currency</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Razorpay Payment ID</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {loading && donations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1B3022]" />
                        <span>Fetching donations from MongoDB...</span>
                      </div>
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No independent donations recorded yet.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => {
                    const userName = d.userId?.fullName || 'Anonymous Donor';
                    const userEmail = d.userId?.email || '—';
                    return (
                      <tr key={d._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1B3022]">{userName}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{userEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-800">{d.charityName}</td>
                        <td className="py-3 px-4 font-bold text-teal-700 font-mono">
                          ₹{d.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono uppercase text-stone-500">{d.currency}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              d.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                          {d.razorpayPaymentId || '—'}
                        </td>
                        <td className="py-3 px-4 text-stone-500 font-mono text-[11px] text-right">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDonations;
