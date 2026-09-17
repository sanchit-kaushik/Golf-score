import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Heart, ArrowRight, ShieldCheck, Sparkles, Calendar } from 'lucide-react';
import { useJoin } from '../../context/JoinContext';
import { useAuth } from '../../context/AuthContext';
import { JoinLayout } from '../../components/join/JoinLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const SuccessPage: React.FC = () => {
  const { selectedPlan } = useJoin();
  const { user, membershipMode } = useAuth();

  const isDemo = membershipMode === 'demo';

  return (
    <JoinLayout currentStep={5}>
      <div className="max-w-2xl mx-auto pt-4 pb-12 text-center">
        
        {/* Step Badge */}
        <div className="flex justify-center mb-3">
          <Badge variant={isDemo ? 'sage' : 'gold'} className="text-[11px] px-3 py-1 font-mono">
            STEP 05 OF 05 • {isDemo ? 'DEMO ACCESS ACTIVATED' : 'MEMBERSHIP ACTIVE'}
          </Badge>
        </div>

        {/* Celebration Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center mx-auto mb-6 shadow-card ${
            isDemo
              ? 'bg-sage-50 border-sage-200 text-sage-700'
              : 'bg-gold-50 border-gold-200 text-gold-600'
          }`}
        >
          {isDemo ? <Sparkles className="w-10 h-10 text-gold-500" /> : <CheckCircle2 className="w-10 h-10 text-sage-600" />}
        </motion.div>

        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal tracking-tight mb-4">
          Welcome to Digital Heroes.
        </h1>

        <p className="text-charcoal-muted text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed mb-8">
          {isDemo
            ? 'Demo membership activated. You now have full access to explore the score tracking engine, monthly draw tickets, and charity impact features.'
            : 'Your subscription is verified and active. You are now prepared to record verified scores, join monthly draws, and make an impact.'}
        </p>

        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-elevated text-left mb-8"
        >
          {/* Status Header */}
          <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase font-mono font-bold text-charcoal-light">
                Subscription Status
              </p>
              <h3 className="font-sans font-extrabold text-lg text-charcoal mt-0.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
                MEMBERSHIP ACTIVE
              </h3>
            </div>

            {isDemo ? (
              <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-3 py-1 rounded-full border border-sage-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                DEMO MEMBERSHIP
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-3 py-1 rounded-full border border-sage-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                ACTIVE MEMBERSHIP
              </span>
            )}
          </div>

          {/* Member Details Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm mb-6">
            <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200">
              <span className="text-charcoal-light font-mono uppercase text-[10px] block mb-1">
                Subscriber Profile
              </span>
              <p className="font-bold text-charcoal">{user?.fullName || 'Demo Golfer'}</p>
              <p className="text-xs text-charcoal-muted">{user?.email || 'member@example.com'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200">
              <span className="text-charcoal-light font-mono uppercase text-[10px] block mb-1">
                Active Plan
              </span>
              <p className="font-bold text-charcoal">{selectedPlan?.name || 'Annual Membership'}</p>
              <p className="text-xs text-sage-700 font-medium">Billed {selectedPlan?.billingPeriod || 'year'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200">
              <span className="text-charcoal-light font-mono uppercase text-[10px] block mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-sage-600 fill-sage-600" />
                Charity Allocation
              </span>
              <p className="font-bold text-charcoal">Minimum 10% Active</p>
              <p className="text-xs text-charcoal-muted">Directed with every cycle</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200">
              <span className="text-charcoal-light font-mono uppercase text-[10px] block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gold-600" />
                Monthly Draw Cycle
              </span>
              <p className="font-bold text-charcoal">Active Entry Enrolled</p>
              <p className="text-xs text-charcoal-muted">Eligible for 5, 4, & 3 match tiers</p>
            </div>
          </div>

          {/* Action to Full Member Dashboard */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sand-100">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal py-3"
            >
              <span>Return to Homepage</span>
            </Link>

            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto min-w-[220px] justify-center group"
              >
                <span>ENTER MEMBER DASHBOARD</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Security / Reassurance Note */}
        <div className="text-center text-xs text-charcoal-light flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sage-600" />
          <span>Session persisted. Safe to refresh or navigate between pages.</span>
        </div>

      </div>
    </JoinLayout>
  );
};
