import React, { useEffect, useState } from 'react';
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

interface ReportData {
  totalUsers: number;
  activeMembers: number;
  totalPrizePool: number;
  totalCharityAllocation: number;
  totalMembershipAllocation: number;
  totalIndependentDonations: number;
  totalWinners: number;
  totalPaidWinnings: number;
  charityImpact: Array<{
    charityId: string;
    charityName: string;
    category: string;
    membershipAllocation: number;
    independentDonations: number;
    totalTracked: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    members: number;
    prizePool: number;
    charity: number;
  }>;
}

export const AdminReports: React.FC = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.admin.getReports();
      if (res.success && res.report) {
        setReport(res.report);
      } else {
        setErrorMsg('Failed to generate system reports.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error generating reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">Financial & Impact Reports</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Comprehensive breakdown of membership revenue, prize pools, disbursements and charity impact
            </p>
          </div>
          <button
            onClick={fetchReports}
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

        {/* 7 Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Total Users</span>
            <div className="text-xl sm:text-2xl font-bold text-[#1B3022] mt-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-stone-400" /> : report?.totalUsers ?? 0}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Active Members</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-stone-400" /> : report?.activeMembers ?? 0}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Total Prize Pool</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
              ₹{(report?.totalPrizePool ?? 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Charity Allocation</span>
            <div className="text-xl sm:text-2xl font-bold text-rose-700 mt-1">
              ₹{(report?.totalCharityAllocation ?? 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Independent Donations</span>
            <div className="text-xl sm:text-2xl font-bold text-teal-700 mt-1">
              ₹{(report?.totalIndependentDonations ?? 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Total Winners</span>
            <div className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-stone-400" /> : report?.totalWinners ?? 0}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm col-span-2 sm:col-span-1 lg:col-span-2">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Total Paid Winnings</span>
            <div className="text-xl sm:text-2xl font-bold text-[#1B3022] mt-1">
              ₹{(report?.totalPaidWinnings ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* CHARITY IMPACT REPORT SECTION */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 font-mono">
                NON-PROFIT IMPACT
              </span>
              <h2 className="text-base font-bold text-[#1B3022]">CHARITY IMPACT</h2>
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              Recorded allocation — Tracked commitments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-stone-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Charity Name</th>
                  <th className="py-3 px-4 font-semibold">Membership Allocation</th>
                  <th className="py-3 px-4 font-semibold">Independent Donations</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Tracked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {loading && !report ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#1B3022]" />
                    </td>
                  </tr>
                ) : !report?.charityImpact || report.charityImpact.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-400">
                      No charity allocations tracked yet.
                    </td>
                  </tr>
                ) : (
                  report.charityImpact.map((c) => (
                    <tr key={c.charityId} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1B3022]">{c.charityName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{c.category}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">
                        ₹{c.membershipAllocation.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">
                        ₹{c.independentDonations.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-right">
                        ₹{c.totalTracked.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-stone-500 italic pt-2">
            * Note: Values represent tracked and recorded commitments allocated from active membership dues and independent donations.
          </p>
        </div>

        {/* Monthly Platform Performance Bar Chart */}
        {report?.monthlyTrends && report.monthlyTrends.length > 0 && (
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 font-mono">
              Monthly Platform Growth (Members & Impact)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
              {report.monthlyTrends.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3"
                >
                  <span className="text-[11px] font-mono font-bold text-stone-600">{t.month}</span>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase font-mono block">Members</span>
                      <span className="text-xs font-bold text-emerald-800">{t.members} active</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase font-mono block">Charity</span>
                      <span className="text-xs font-bold text-rose-700">₹{t.charity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
