import React from 'react';
import { Target, Sparkles, HeartHandshake, ShieldCheck, LineChart } from 'lucide-react';
import { MEMBERSHIP_BENEFITS } from '../../data/plans';
import { Card } from '../ui/Card';

export const MembershipBenefits: React.FC = () => {
  const getBenefitIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Target className="w-5 h-5 text-sage-600" />;
      case 1:
        return <Sparkles className="w-5 h-5 text-gold-500" />;
      case 2:
        return <HeartHandshake className="w-5 h-5 text-sage-600" />;
      case 3:
        return <ShieldCheck className="w-5 h-5 text-sage-600" />;
      case 4:
        return <LineChart className="w-5 h-5 text-sage-600" />;
      default:
        return <Target className="w-5 h-5 text-sage-600" />;
    }
  };

  return (
    <div className="mt-16 sm:mt-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal tracking-tight">
          What Every Membership Includes
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
          Designed around the official Golf-Hero principles: genuine play, transparent reward tiers, and certified charitable contributions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {MEMBERSHIP_BENEFITS.map((benefit, index) => (
          <Card key={index} className="p-5 bg-white border-sand-200/90 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center mb-3">
                {getBenefitIcon(index)}
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-charcoal mb-1.5 leading-snug">
                {benefit.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-charcoal-muted leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
