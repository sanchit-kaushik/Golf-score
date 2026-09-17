import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Ticket, Trophy, Heart, HandCoins, BarChart3, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

interface OverviewStats {
  totalUsers: number;
  activeMembers: number;
  currentPrizePool: number;
  totalCharityAllocations: number;
  membershipCharityAllocations: number;
  totalDonations: number;
  totalWinners: number;
}

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.admin.getOverview();
      if (res.success && res.stats) {
        setStats(res.stats);
      } else {
        setError('Failed to load overview data.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const statCards = [
    {
      title: 'TOTAL USERS',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      link: '/admin/users',
      linkText: 'Manage Users',
    },
    {
      title: 'ACTIVE MEMBERS',
      value: stats?.activeMembers ?? 0,
      icon: Shield,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-100',
      link: '/admin/users',
      linkText: 'View Active',
    },
    {
      title: 'CURRENT PRIZE POOL',
      value: `₹${(stats?.currentPrizePool ?? 0).toLocaleString()}`,
      icon: Ticket,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      link: '/admin/draws',
      linkText: 'Draw Controls',
    },
    {
      title: 'CHARITY ALLOCATIONS',
      value: `₹${(stats?.totalCharityAllocations ?? 0).toLocaleString()}`,
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      link: '/admin/charities',
      linkText: 'View Charities',
    },
    {
      title: 'TOTAL DONATIONS',
      value: `₹${(stats?.totalDonations ?? 0).toLocaleString()}`,
      icon: HandCoins,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100',
      link: '/admin/donations',
      linkText: 'Independent Donations',
    },
    {
      title: 'TOTAL WINNERS',
      value: stats?.totalWinners ?? 0,
      icon: Trophy,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-100',
      link: '/admin/winners',
      linkText: 'Review Winnings',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">System Overview</h1>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              Live platform metrics powered directly by MongoDB Atlas
            </p>
          </div>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Real MongoDB Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-mono">
                      {card.title}
                    </span>
                    <div className="text-2xl sm:text-3xl font-bold text-[#1B3022] mt-1 tracking-tight">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin text-stone-400 mt-1" /> : card.value}
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${card.bg}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <Link
                    to={card.link}
                    className="font-semibold text-[#1B3022] hover:text-[#2C4C38] flex items-center gap-1 group"
                  >
                    <span>{card.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <span className="text-[10px] text-stone-400 font-mono">Real MongoDB Data</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Launchpad */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 font-mono mb-4">
            Administrative Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              to="/admin/users"
              className="p-4 rounded-xl border border-stone-100 bg-[#FAF8F5] hover:bg-[#F2EFE9] transition-all flex items-start gap-3 group"
            >
              <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#1B3022] group-hover:text-blue-700">User Management</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Inspect registered accounts, plans and membership state.</p>
              </div>
            </Link>

            <Link
              to="/admin/draws"
              className="p-4 rounded-xl border border-stone-100 bg-[#FAF8F5] hover:bg-[#F2EFE9] transition-all flex items-start gap-3 group"
            >
              <Ticket className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#1B3022] group-hover:text-amber-700">Monthly Draw & Simulation</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Lock cycle, simulate random draw preview, or publish results.</p>
              </div>
            </Link>

            <Link
              to="/admin/winners"
              className="p-4 rounded-xl border border-stone-100 bg-[#FAF8F5] hover:bg-[#F2EFE9] transition-all flex items-start gap-3 group"
            >
              <Trophy className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#1B3022] group-hover:text-purple-700">Winners & Verifications</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Review scorecard proof, approve/reject and mark payouts.</p>
              </div>
            </Link>

            <Link
              to="/admin/charities"
              className="p-4 rounded-xl border border-stone-100 bg-[#FAF8F5] hover:bg-[#F2EFE9] transition-all flex items-start gap-3 group"
            >
              <Heart className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#1B3022] group-hover:text-rose-700">Charity Partners</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Add, activate/deactivate charities and view tracked support.</p>
              </div>
            </Link>

            <Link
              to="/admin/donations"
              className="p-4 rounded-xl border border-stone-100 bg-[#FAF8F5] hover:bg-[#F2EFE9] transition-all flex items-start gap-3 group"
            >
              <HandCoins className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#1B3022] group-hover:text-teal-700">Independent Donations</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">View one-time Razorpay test donations logged in MongoDB.</p>
              </div>
            </Link>

            <Link
              to="/admin/reports"
              className="p-4 rounded-xl border border-stone-100 bg-[#FAF8F5] hover:bg-[#F2EFE9] transition-all flex items-start gap-3 group"
            >
              <BarChart3 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#1B3022] group-hover:text-emerald-700">Reports & Analytics</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Detailed Charity Impact reports and performance trends.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
