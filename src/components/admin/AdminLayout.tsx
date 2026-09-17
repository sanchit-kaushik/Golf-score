import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Ticket,
  Trophy,
  Heart,
  HandCoins,
  BarChart3,
  LogOut,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Draws', path: '/admin/draws', icon: Ticket },
    { label: 'Winners', path: '/admin/winners', icon: Trophy },
    { label: 'Charities', path: '/admin/charities', icon: Heart },
    { label: 'Donations', path: '/admin/donations', icon: HandCoins },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1B3022] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1B3022] text-white border-b border-[#2C4C38] px-4 sm:px-6 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B89628] text-[#1B3022] flex items-center justify-center font-bold text-sm shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-widest text-sm text-white leading-none">
                  DIGITAL HEROES
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#D4AF37] font-semibold mt-0.5">
                  ADMIN CONTROL
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1 text-xs text-stone-300 hover:text-white transition-colors bg-[#2C4C38] px-3 py-1.5 rounded-lg border border-[#3E654C]"
            >
              <span>Member Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2 text-xs border-l border-[#2C4C38] pl-4">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-[#1B3022] font-bold flex items-center justify-center text-xs">
                A
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold leading-tight text-white">{user?.fullName || 'Administrator'}</span>
                <span className="text-[10px] text-[#D4AF37] font-mono">admin role</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-300 hover:text-white hover:bg-red-900/40 rounded-lg transition-colors border border-red-800/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row px-4 sm:px-6 py-6 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-3 shadow-sm sticky top-20">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">
              Administration Menu
            </div>
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-[#1B3022] text-[#FDFBF7] shadow-sm'
                          : 'text-stone-600 hover:text-[#1B3022] hover:bg-[#F2EFE9]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-3 mt-3 border-t border-stone-100 hidden md:block">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
