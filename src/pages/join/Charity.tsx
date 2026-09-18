import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, CheckCircle2, Shield, Info } from 'lucide-react';
import { useJoin } from '../../context/JoinContext';
import { useAuth } from '../../context/AuthContext';
import { JoinLayout } from '../../components/join/JoinLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FEATURED_CHARITIES } from '../../data/content';

export const CharityPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPlan } = useJoin();
  const { user } = useAuth();

  const handleContinue = () => {
    navigate('/join/payment');
  };

  return (
    <JoinLayout currentStep={3}>
      <div className="max-w-2xl mx-auto pt-4 pb-12 text-center">
        
        {/* Step Badge */}
        <div className="flex justify-center mb-3">
          <Badge variant="sage" className="text-[11px] px-3 py-1 font-mono">
            STEP 03 OF 05 • CHARITY PLEDGE
          </Badge>
        </div>

        {/* Headline requested by PRD */}
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal tracking-tight mb-4">
          Choose a cause that <br />
          <span className="italic text-sage-700">matters to you.</span>
        </h1>

        <p className="text-charcoal-muted text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed mb-8">
          Your membership can make an impact. Choose a verified charity and direct part of your membership contribution toward that cause with every swing.
        </p>

        {/* Selected Context Summary */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-sand-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage-50 text-sage-700 flex items-center justify-center border border-sage-200 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-charcoal-light font-bold">
                Golfer Profile
              </p>
              <p className="text-xs sm:text-sm font-bold text-charcoal">
                {user?.fullName || 'Golfer'} • {selectedPlan?.name || 'Annual Membership'}
              </p>
            </div>
          </div>
          <Link
            to="/join/account"
            className="text-xs font-semibold text-sage-700 hover:text-sage-900 underline underline-offset-4"
          >
            Edit Profile
          </Link>
        </div>

        {/* PRD Rules Explanation Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-sand-200 shadow-card text-left mb-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-700">
              <Heart className="w-5 h-5 fill-sage-600" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-sage-800 bg-sage-100 px-2 py-0.5 rounded">
                Charity Allocation Rule: Minimum 10% contribution
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-charcoal mt-1">
                How Charity Giving Works
              </h3>
            </div>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm text-charcoal mb-6">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-800 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <p>
                <strong>Minimum 10% Contribution:</strong> Under the Golf-Hero charter, at least 10% of your membership fee is automatically allocated to your selected cause.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-800 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <p>
                <strong>Voluntary Boost Option:</strong> You may choose to increase your contribution percentage (15%, 20%, 25%, 30%, 50%, 75%, 100%) at any time in your dashboard without affecting your draw eligibility.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-800 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <p>
                <strong>Independent Donations:</strong> Make direct, voluntary contributions outside of regular membership fees whenever inspired. Independent donations are separate from gameplay and draw prizes.
              </p>
            </div>
          </div>

          {/* Allocation Transparency Callout */}
          <div className="p-4 rounded-2xl bg-sand-50/90 border border-sand-200 flex items-start gap-3 mb-6">
            <Info className="w-4 h-4 text-sage-700 mt-0.5 shrink-0" />
            <p className="text-xs text-charcoal-muted leading-relaxed">
              <strong>Transparent Economics:</strong> For the {selectedPlan?.name || 'Selected Plan'} (₹{selectedPlan?.price || 29}), a 10% allocation provides <strong>₹{((selectedPlan?.price || 29) * 0.1).toFixed(2)}</strong> allocated to your selected cause. You can adjust this ratio up to 100% anytime.
            </p>
          </div>

          {/* Sample Causes Preview */}
          <div className="mb-6">
            <p className="text-xs font-bold text-charcoal-light uppercase tracking-wider mb-2.5">
              Preview Partner Causes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FEATURED_CHARITIES.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-background border border-sand-200 text-left">
                  <p className="font-bold text-xs text-charcoal truncate">{c.name}</p>
                  <p className="text-[10px] text-sage-700 mt-0.5">{c.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sand-100">
            <Link
              to="/join/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Account</span>
            </Link>

            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              className="w-full sm:w-auto min-w-[200px] justify-center group"
            >
              <span>CONTINUE TO PAYMENT</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

        </motion.div>

        {/* Security Reassurance */}
        <div className="text-center text-xs text-charcoal-light flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-sage-600" />
          <span>Independent annual audit of all charitable distributions</span>
        </div>

      </div>
    </JoinLayout>
  );
};
