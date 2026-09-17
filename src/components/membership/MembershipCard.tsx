import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, CheckCircle2 } from 'lucide-react';
import type { MembershipPlan } from '../../types';
import { Badge } from '../ui/Badge';

interface MembershipCardProps {
  plan: MembershipPlan;
  isSelected: boolean;
  onSelect: () => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  plan,
  isSelected,
  onSelect,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className={`relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 flex flex-col justify-between border-2 text-left ${
        isSelected
          ? 'bg-white border-sage-600 shadow-elevated ring-2 ring-sage-500/20'
          : 'bg-white/80 hover:bg-white border-sand-200/90 shadow-card hover:border-sand-300'
      }`}
    >
      {/* Top Badge (e.g. BEST VALUE) */}
      {plan.badge && (
        <div className="absolute -top-3.5 right-6">
          <Badge variant="gold" className="shadow-sm font-bold tracking-widest text-[10px] py-1 px-3">
            <Sparkles className="w-3 h-3 mr-1 text-gold-600" />
            {plan.badge}
          </Badge>
        </div>
      )}

      <div>
        {/* Selection Indicator & Plan Name */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal tracking-tight">
              {plan.name}
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {plan.tagline}
            </p>
          </div>

          {/* Radio / Check Circle */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-sage-600 text-white shadow-sm ring-2 ring-sage-200'
                : 'border-2 border-sand-300 bg-sand-50/50 text-transparent'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        {/* Pricing Block */}
        <div className="py-5 border-y border-sand-100 my-5">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-charcoal">
              {plan.currency}{plan.price}
            </span>
            <span className="text-xs uppercase font-bold text-charcoal-light tracking-wider">
              / {plan.billing}
            </span>
          </div>

          {/* Discount / Monthly Breakdown if available */}
          {plan.discount && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-block text-[11px] font-bold text-sage-800 bg-sage-50 px-2.5 py-0.5 rounded-md border border-sage-200">
                {plan.discount}
              </span>
              {plan.monthlyEquivalent && (
                <span className="text-xs text-charcoal-muted">
                  (${plan.monthlyEquivalent}/mo equivalent)
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-charcoal-light mt-2">
            {plan.billingDescription}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6">
          {plan.description}
        </p>

        {/* Features Checklist */}
        <div className="space-y-3 pt-2">
          <p className="text-[11px] font-mono uppercase tracking-widest text-charcoal font-bold">
            What's included:
          </p>
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal">
              <div className="w-4 h-4 rounded-full bg-sage-50 text-sage-700 flex items-center justify-center mt-0.5 shrink-0 border border-sage-200">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Select Button Indicator */}
      <div className="mt-8 pt-6 border-t border-sand-100">
        <button
          type="button"
          onClick={onSelect}
          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isSelected
              ? 'bg-sage-600 text-white shadow-sm hover:bg-sage-700'
              : 'bg-sand-100 text-charcoal hover:bg-sand-200 border border-sand-200'
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>SELECTED PLAN</span>
            </>
          ) : (
            <span>SELECT {plan.name.toUpperCase()}</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};
