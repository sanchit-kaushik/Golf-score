import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Star, StarOff } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

interface CharityRecord {
  _id: string;
  charityId: string;
  name: string;
  category: string;
  summary: string;
  imageUrl: string;
  website?: string;
  active: boolean;
  featured: boolean;
  userCount?: number;
  totalAllocated?: number;
}

export const AdminCharities: React.FC = () => {
  const [charities, setCharities] = useState<CharityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add Charity Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    summary: '',
    imageUrl: '',
    website: '',
    featured: true,
    active: true,
  });

  const fetchCharities = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.admin.getCharities();
      if (res.success && Array.isArray(res.charities)) {
        setCharities(res.charities);
      } else {
        setErrorMsg('Failed to load charities list.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error fetching charities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleToggleActive = async (c: CharityRecord) => {
    try {
      setActionLoading(c._id);
      setErrorMsg(null);
      const newActive = !c.active;
      const res = await api.admin.updateCharity(c._id, { active: newActive });
      if (res.success) {
        setCharities((prev) =>
          prev.map((item) => (item._id === c._id ? { ...item, active: newActive } : item))
        );
        setSuccessMsg(`Charity "${c.name}" ${newActive ? 'activated' : 'deactivated'} successfully.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to toggle active state.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (c: CharityRecord) => {
    try {
      setActionLoading(c._id);
      setErrorMsg(null);
      const newFeatured = !c.featured;
      const res = await api.admin.updateCharity(c._id, { featured: newFeatured });
      if (res.success) {
        setCharities((prev) =>
          prev.map((item) => (item._id === c._id ? { ...item, featured: newFeatured } : item))
        );
        setSuccessMsg(`Charity "${c.name}" featured status updated.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to toggle featured status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.summary) {
      setErrorMsg('Name, category, and summary are required.');
      return;
    }

    try {
      setActionLoading('create');
      setErrorMsg(null);
      const res = await api.admin.createCharity({
        ...formData,
        imageUrl:
          formData.imageUrl ||
          'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=900&q=80',
      });
      if (res.success) {
        setSuccessMsg(`New charity "${formData.name}" added successfully.`);
        setShowAddModal(false);
        setFormData({
          name: '',
          category: '',
          summary: '',
          imageUrl: '',
          website: '',
          featured: true,
          active: true,
        });
        fetchCharities();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to add charity.');
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
            <h1 className="text-xl font-bold tracking-tight text-[#1B3022]">Charity Management</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage charity causes, monitor allocation metrics, and configure spotlight causes
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B3022] hover:bg-[#2C4C38] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Add Charity</span>
            </button>
            <button
              onClick={fetchCharities}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
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

        {/* Charities Table */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-stone-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Charity</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Active</th>
                  <th className="py-3 px-4 font-semibold">Featured</th>
                  <th className="py-3 px-4 font-semibold">Users</th>
                  <th className="py-3 px-4 font-semibold">Allocated Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {loading && charities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1B3022]" />
                        <span>Querying MongoDB charities...</span>
                      </div>
                    </td>
                  </tr>
                ) : charities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No charities found in database.
                    </td>
                  </tr>
                ) : (
                  charities.map((c) => {
                    const isBusy = actionLoading === c._id;
                    return (
                      <tr key={c._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-[#1B3022]">{c.name}</div>
                              <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">{c.summary}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-700">{c.category}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              c.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              c.featured
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {c.featured ? 'Featured' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-800">
                          {c.userCount || 0}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          ₹{(c.totalAllocated || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleActive(c)}
                              disabled={isBusy}
                              title={c.active ? 'Deactivate charity' : 'Activate charity'}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                c.active
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {c.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleToggleFeatured(c)}
                              disabled={isBusy}
                              title={c.featured ? 'Remove featured spotlight' : 'Make featured'}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                c.featured
                                  ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                                  : 'border-stone-200 text-stone-400 hover:bg-stone-100'
                              }`}
                            >
                              {c.featured ? <Star className="w-3.5 h-3.5 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                            </button>
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

        {/* Add Charity Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-bold text-stone-900">Add New Charity Partner</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCharity} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Charity Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Clean Oceans Foundation"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1B3022]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Environmental Stewardship"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1B3022]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Summary *</label>
                  <input
                    type="text"
                    required
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Short description of charity mission"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1B3022]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1B3022]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1B3022]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-stone-300 text-[#1B3022]"
                    />
                    <span>Featured Cause</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-stone-300 text-[#1B3022]"
                    />
                    <span>Active Cause</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'create'}
                    className="px-4 py-1.5 rounded-lg bg-[#1B3022] hover:bg-[#2C4C38] text-white font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    {actionLoading === 'create' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Save Charity</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCharities;
