import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/Navbar/Navbar';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testAccountApplied, setTestAccountApplied] = useState(false);

  const handleUseAdminTestAccount = () => {
    setEmail('admin@digitalheroes.test');
    setPassword('Admin@12345');
    setError(null);
    setTestAccountApplied(true);
    setTimeout(() => setTestAccountApplied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      // Check stored user in localStorage / auth state
      try {
        const saved = localStorage.getItem('dh_user');
        if (saved) {
          const u = JSON.parse(saved);
          if (u.role === 'admin') {
            navigate('/admin');
            return;
          }
        }
      } catch {
        // ignore
      }
      // If email is admin test account
      if (email.trim().toLowerCase() === 'admin@digitalheroes.test') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] flex flex-col justify-between selection:bg-[#2C4C38] selection:text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-28">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white border border-[#E5E0D8] rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#1B3022] text-white p-6 text-center border-b border-[#2C4C38]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2C4C38] to-[#1B3022] border border-[#3E654C] mx-auto flex items-center justify-center mb-3 shadow-md">
              <Shield className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">GOLF-HERO</h1>
            <p className="text-xs text-white/75 mt-1 font-mono uppercase tracking-widest">
              Secure Member & Admin Access
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* DEMO / TEST ACCESS SECTION */}
            <div className="p-4 rounded-xl bg-[#F7F4EE] border-2 border-dashed border-[#D4AF37]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B3022] text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase font-mono">
                  <UserCheck className="w-3 h-3" /> DEMO / TEST ACCESS
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Evaluation Mode</span>
              </div>

              <div className="text-xs space-y-1 font-mono bg-white p-2.5 rounded-lg border border-[#E5E0D8] text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Admin:</span>
                  <span className="font-semibold text-[#1B3022]">admin@digitalheroes.test</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Password:</span>
                  <span className="font-semibold text-[#1B3022]">Admin@12345</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleUseAdminTestAccount}
                  className="w-full py-2 px-3 rounded-lg bg-[#2C4C38] hover:bg-[#1B3022] text-[#FDFBF7] text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
                >
                  {testAccountApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Credentials Applied!
                    </>
                  ) : (
                    <>
                      <span>USE ADMIN TEST ACCOUNT</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-stone-500 text-center italic">
                  Test credentials for evaluation/demo purposes.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C4C38] focus:border-transparent text-stone-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C4C38] focus:border-transparent text-stone-900 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-3 mt-2 bg-[#1B3022] hover:bg-[#2C4C38] text-white font-bold tracking-wider text-sm flex items-center justify-center gap-2 shadow-md rounded-xl"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-stone-100 text-center space-y-2">
              <p className="text-xs text-stone-500">
                Don't have a membership yet?{' '}
                <Link to="/join" className="text-[#2C4C38] font-semibold hover:underline">
                  Join the Club
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
