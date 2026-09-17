import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Shield, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

interface UserRecord {
  _id: string;
  id?: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  membershipStatus: string;
  membershipMode: string;
  membershipPlan: string | null;
  paymentStatus: string;
  createdAt: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.admin.getUsers();
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      } else {
        setError('Failed to load users list.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user: UserRecord) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const userId = user._id || user.id || '';
    if (!userId) return;

    try {
      setUpdatingId(userId);
      const res = await api.admin.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: newRole } : u))
        );
        setActionMessage(`Updated role for ${user.fullName} to ${newRole.toUpperCase()}.`);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">User Management</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Real MongoDB users registered on Digital Heroes ({users.length} total accounts)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3022] text-stone-900 w-48 sm:w-60"
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-stone-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Membership</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Payment Status</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1B3022]" />
                        <span>Querying MongoDB users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const userId = u._id || u.id || '';
                    const isUserUpdating = updatingId === userId;
                    return (
                      <tr key={userId} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#1B3022]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[10px] text-stone-700">
                              {u.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                              u.role === 'admin'
                                ? 'bg-[#1B3022] text-[#D4AF37] border border-[#2C4C38]'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {u.role === 'admin' && <Shield className="w-3 h-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              u.membershipStatus === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {u.membershipStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 uppercase font-mono text-stone-600">
                          {u.membershipPlan || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                              u.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.paymentStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {u.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isUserUpdating || u.email === 'admin@digitalheroes.test'}
                            title={
                              u.email === 'admin@digitalheroes.test'
                                ? 'Primary seeded admin cannot be demoted'
                                : 'Toggle role'
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              u.email === 'admin@digitalheroes.test'
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                            }`}
                          >
                            {isUserUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : u.role === 'admin' ? (
                              'Make User'
                            ) : (
                              'Make Admin'
                            )}
                          </button>
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

export default AdminUsers;
