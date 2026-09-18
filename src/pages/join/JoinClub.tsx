import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { useJoin } from '../../context/JoinContext';
import { MEMBERSHIP_PLANS } from '../../data/plans';
import { JoinLayout } from '../../components/join/JoinLayout';
import { MembershipCard } from '../../components/membership/MembershipCard';
import { MembershipBenefits } from '../../components/membership/MembershipBenefits';
import { CharityCallout } from '../../components/membership/CharityCallout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const JoinClubPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPlanId, selectPlan, selectedPlan } = useJoin();

  const handleContinue = () => {
    if (!selectedPlanId) return;
    navigate('/join/account');
  };

  return (
    <JoinLayout currentStep={1}>
      <div className="max-w-5xl mx-auto pt-4 pb-12">
        
        {/* Editorial Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="flex justify-center mb-3">
            <Badge variant="sage" className="text-[11px] px-3 py-1 font-mono">
              STEP 01 OF 05 • MEMBERSHIP SELECTION
            </Badge>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl text-charcoal font-normal tracking-tight leading-[1.1] mb-5">
            Choose how you <br />
            <span className="italic text-sage-700">play.</span>
          </h1>

          <p className="text-charcoal-muted text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Your Golf-Hero membership unlocks verified golf score tracking, entry into high-tier monthly draws, prize opportunities, and certified contributions to a charity of your choice.
          </p>
        </motion.div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-10">
          {MEMBERSHIP_PLANS.map((plan) => (
            <MembershipCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              onSelect={() => selectPlan(plan.id)}
            />
          ))}
        </div>

        {/* Continue Action Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-sand-200 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 text-left">
            {selectedPlan ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-700 border border-sage-200 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-mono font-bold text-charcoal-light">
                    Selected Plan
                  </p>
                  <p className="text-sm font-bold text-charcoal">
                    {selectedPlan.name} • {selectedPlan.currency}{selectedPlan.price}/{selectedPlan.billing}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-sand-100 text-charcoal-light flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-mono font-bold text-charcoal-light">
                    Selection Required
                  </p>
                  <p className="text-sm text-charcoal-muted">
                    Please select Monthly or Annual membership above to proceed.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="w-full sm:w-auto">
            <Button
              variant={selectedPlanId ? 'primary' : 'ghost'}
              size="lg"
              disabled={!selectedPlanId}
              onClick={handleContinue}
              className={`w-full sm:w-auto min-w-[200px] justify-center group ${
                !selectedPlanId ? 'opacity-50 cursor-not-allowed bg-sand-200 text-charcoal-light' : ''
              }`}
            >
              <span>CONTINUE TO ACCOUNT</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* Charity Connection Callout */}
        <CharityCallout />

        {/* Membership Benefits Grid */}
        <MembershipBenefits />

        {/* Micro Guarantee Note */}
        <div className="mt-12 text-center text-xs text-charcoal-light flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-sage-600" />
            No hidden subscription fees
          </span>
          <span>•</span>
          <span>Cancel or switch tiers anytime in dashboard</span>
        </div>

      </div>
    </JoinLayout>
  );
};
