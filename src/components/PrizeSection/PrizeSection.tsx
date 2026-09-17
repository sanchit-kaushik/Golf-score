import React from 'react';
import { motion } from 'framer-motion';
import { Repeat, Users } from 'lucide-react';
import { PRIZE_TIERS } from '../../data/content';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const PrizeSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="flex justify-center mb-4">
            <Badge variant="gold">PRIZE POOL ALLOCATION</Badge>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-charcoal tracking-tight leading-[1.15] mb-6">
            Transparent distribution. <br />
            <span className="italic text-gold-600">Pure member rewards.</span>
          </h2>
          <p className="text-charcoal-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            100% of the allocated prize pool is distributed across three distinct match tiers. Clearly structured, fully auditable, and designed to reward skill and fortune.
          </p>
        </div>

        {/* Visual Percentage Distribution Bar */}
        <div className="max-w-4xl mx-auto mb-14">
          <div className="h-6 w-full rounded-full bg-sand-100 p-1 flex overflow-hidden border border-sand-200">
            <div
              style={{ width: '40%' }}
              className="bg-gradient-to-r from-gold-500 to-gold-600 h-full rounded-l-full flex items-center justify-center text-[10px] font-bold text-white tracking-wider"
              title="5-Number Match: 40%"
            >
              5-MATCH (40%)
            </div>
            <div
              style={{ width: '35%' }}
              className="bg-sage-600 h-full flex items-center justify-center text-[10px] font-bold text-white tracking-wider mx-0.5"
              title="4-Number Match: 35%"
            >
              4-MATCH (35%)
            </div>
            <div
              style={{ width: '25%' }}
              className="bg-charcoal h-full rounded-r-full flex items-center justify-center text-[10px] font-bold text-white tracking-wider"
              title="3-Number Match: 25%"
            >
              3-MATCH (25%)
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold text-charcoal-muted mt-2 px-1">
            <span className="text-gold-600 font-bold">5 Numbers: 40% Pool</span>
            <span className="text-sage-700 font-bold">4 Numbers: 35% Pool</span>
            <span className="text-charcoal font-bold">3 Numbers: 25% Pool</span>
          </div>
        </div>

        {/* 3 Tier Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRIZE_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.matchCount}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <Card
                hoverEffect
                className={`h-full flex flex-col justify-between p-7 relative ${
                  idx === 0
                    ? 'border-gold-300/80 bg-gradient-to-b from-gold-50/40 to-white shadow-elevated'
                    : 'bg-white border-sand-200'
                }`}
              >
                {idx === 0 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold-500 text-white text-[10px] font-mono uppercase tracking-widest px-3 py-0.5 rounded-full font-bold shadow-sm">
                    Features Rollover
                  </div>
                )}

                <div>
                  {/* Tier Percentage Header */}
                  <div className="flex items-baseline justify-between border-b border-sand-100 pb-4 mb-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                        {tier.tierName}
                      </span>
                      <h3 className="font-sans font-extrabold text-xl text-charcoal mt-0.5">
                        {tier.matchCount}
                      </h3>
                    </div>
                    <div className="font-mono text-3xl font-extrabold text-charcoal">
                      {tier.percentage}%
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                    {tier.description}
                  </p>
                </div>

                {/* Rollover or Distribution Rule */}
                <div className="pt-4 border-t border-sand-100 flex items-start gap-2.5 text-xs text-charcoal">
                  {idx === 0 ? (
                    <>
                      <Repeat className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
                      <span className="font-medium text-gold-800">
                        {tier.rolloverInfo}
                      </span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-sage-600 mt-0.5 shrink-0" />
                      <span className="font-medium text-charcoal-muted">
                        {tier.rolloverInfo}
                      </span>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Rollover & Fair Splitting Explanation Callout */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-sand-50/90 border border-sand-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-charcoal mb-1">Rollover Guarantee</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                If no member scores a full 5-number match in a given month, that month's 40% pool allocation does not expire — it carries over directly into the next month's 5-number jackpot.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-sand-50/90 border border-sand-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-charcoal mb-1">Equal Split Principle</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                When multiple members match within the same tier (5, 4, or 3 numbers), that tier's total allocated pool is split equally and transparently among all verified qualifiers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
