import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Shield, CheckCircle2, User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useJoin } from '../../context/JoinContext';
import { useAuth } from '../../context/AuthContext';
import { JoinLayout } from '../../components/join/JoinLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPlan, account, updateAccount } = useJoin();
  const { signup, login, isAuthenticated, user, isLoading: authLoading } = useAuth();

  // Mode: 'signup' vs 'signin'
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  // Form Fields
  const [fullName, setFullName] = useState(account.fullName || '');
  const [email, setEmail] = useState(account.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    if (mode === 'signup') {
      const res = await signup(fullName, email, password, selectedPlan?.id || 'yearly');
      if (res.success) {
        updateAccount({ fullName, email });
        setSuccessMessage('Account created successfully! Automatically signing you in...');
        // CRITICAL UX: AUTOMATIC LOGIN - Continue immediately to /join/charity
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/join/charity');
        }, 500);
      } else {
        setIsSubmitting(false);
        setServerError(res.error || 'Registration error');
      }
    } else {
      // Sign In mode
      const res = await login(email, password);
      if (res.success) {
        updateAccount({ email, fullName: fullName || user?.fullName || '' });
        setSuccessMessage('Signed in successfully! Continuing...');
        setTimeout(() => {
          setIsSubmitting(false);
          if (email.trim().toLowerCase() === 'admin@digitalheroes.test') {
            navigate('/admin');
          } else {
            navigate('/join/charity');
          }
        }, 500);
      } else {
        setIsSubmitting(false);
        setServerError(res.error || 'Invalid credentials. Please try again.');
      }
    }
  };

  return (
    <JoinLayout currentStep={2}>
      <div className="max-w-xl mx-auto pt-4 pb-12">
        
        {/* Step Badge */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Badge variant="sage" className="text-[11px] px-3 py-1 font-mono">
              STEP 02 OF 05 • {mode === 'signup' ? 'ACCOUNT CREATION' : 'MEMBER SIGN IN'}
            </Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal tracking-tight mb-3">
            {mode === 'signup' ? 'Create your account.' : 'Welcome back.'}
          </h1>
          <p className="text-charcoal-muted text-sm sm:text-base font-light">
            {mode === 'signup'
              ? 'Set up your golfer profile with secure email and password.'
              : 'Sign in with your email and password to continue your membership setup.'}
          </p>
        </div>

        {/* Selected Plan Summary Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-sand-200 shadow-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage-50 text-sage-700 flex items-center justify-center border border-sage-200 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-charcoal-light font-bold">
                Selected Plan
              </p>
              <p className="text-xs sm:text-sm font-bold text-charcoal">
                {selectedPlan
                  ? `${selectedPlan.name} • $${selectedPlan.price}/${selectedPlan.billingPeriod}`
                  : 'Annual Membership (Default)'}
              </p>
            </div>
          </div>
          <Link
            to="/join"
            className="text-xs font-semibold text-sage-700 hover:text-sage-900 underline underline-offset-4"
          >
            Change
          </Link>
        </div>

        {/* Already Authenticated Banner if applicable */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
              <span>
                Active Session: <strong>{user.fullName}</strong> ({user.email})
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold bg-white px-2 py-0.5 rounded border border-sage-200">
              Authenticated
            </span>
          </div>
        )}

        {/* PRD Rule Banner: ACCOUNT CREATED != MEMBERSHIP ACTIVE */}
        <div className="mb-6 p-4 rounded-2xl bg-sand-50/90 border border-sand-200 text-xs text-charcoal-muted flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-charcoal">Important Membership Rule:</span> Creating an account establishes your golfer profile. Your membership becomes <strong className="text-charcoal">Active</strong> upon completing charity selection and payment verification in subsequent steps.
          </div>
        </div>

        {/* Mode Switch Tabs (Create Account vs Sign In) */}
        <div className="flex rounded-2xl bg-sand-100/80 p-1.5 mb-6 border border-sand-200">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setServerError(null);
              setErrors({});
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setServerError(null);
              setErrors({});
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="leading-relaxed">{serverError}</p>
          </motion.div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-800 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <p className="leading-relaxed font-semibold">{successMessage}</p>
          </motion.div>
        )}

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card"
        >
          {mode === 'signin' && (
            <div className="mb-6 p-4 rounded-xl bg-[#F7F4EE] border-2 border-dashed border-[#D4AF37]/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B3022] text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase font-mono">
                  DEMO / TEST ACCESS
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Evaluation Mode</span>
              </div>
              <div className="text-xs space-y-1 font-mono bg-white p-2 rounded-lg border border-[#E5E0D8] text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Admin:</span>
                  <span className="font-semibold text-[#1B3022]">admin@digitalheroes.test</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Password:</span>
                  <span className="font-semibold text-[#1B3022]">Admin@12345</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@digitalheroes.test');
                  setPassword('Admin@12345');
                  setErrors({});
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#2C4C38] hover:bg-[#1B3022] text-[#FDFBF7] text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                USE ADMIN TEST ACCOUNT
              </button>
              <p className="text-[10px] text-stone-500 text-center italic">
                Test credentials for evaluation/demo purposes.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name (Sign Up only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-light">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Cameron Smith"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-sand-50/50 border transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 ${
                        errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-sand-200 hover:border-sand-300'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.fullName}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-light">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    if (serverError) setServerError(null);
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-sand-50/50 border transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 ${
                    errors.email ? 'border-red-400 bg-red-50/20' : 'border-sand-200 hover:border-sand-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    if (serverError) setServerError(null);
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-sand-50/50 border transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 ${
                    errors.password ? 'border-red-400 bg-red-50/20' : 'border-sand-200 hover:border-sand-300'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-light">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-sand-50/50 border transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 ${
                        errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-sand-200 hover:border-sand-300'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.confirmPassword}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Strict Notice: Email + Password Only */}
            <div className="text-[11px] text-charcoal-light pt-1">
              Authentication is strictly email and password. No OTP, phone verification, or third-party tracking required.
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sand-100">
              <Link
                to="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal py-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Plan Selection</span>
              </Link>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || authLoading}
                className="w-full sm:w-auto min-w-[200px] justify-center group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>

          </form>

          {/* Bottom Switch Link */}
          <div className="mt-6 pt-4 text-center border-t border-sand-100 text-xs text-charcoal-muted">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setServerError(null);
                    setErrors({});
                  }}
                  className="font-bold text-sage-800 hover:text-sage-900 underline underline-offset-4 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setServerError(null);
                    setErrors({});
                  }}
                  className="font-bold text-sage-800 hover:text-sage-900 underline underline-offset-4 cursor-pointer"
                >
                  Create one
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Security Reassurance */}
        <div className="mt-8 text-center text-xs text-charcoal-light flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-sage-600" />
          <span>Passkeys & bcrypt credentials encrypted. No social tracking.</span>
        </div>

      </div>
    </JoinLayout>
  );
};
