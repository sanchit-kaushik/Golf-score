import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles, UserCheck, FileSpreadsheet, Calendar, Award, Trophy } from 'lucide-react';
import { DRAW_STEPS } from '../../data/content';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const DrawSection: React.FC = () => {
  const getStepIcon = (num: string) => {
    switch (num) {
      case '01':
        return <UserCheck className="w-5 h-5 text-sage-600" />;
      case '02':
        return <FileSpreadsheet className="w-5 h-5 text-sage-600" />;
      case '03':
        return <Calendar className="w-5 h-5 text-sage-600" />;
      case '04':
        return <Award className="w-5 h-5 text-gold-500" />;
      case '05':
        return <Trophy className="w-5 h-5 text-gold-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-sage-600" />;
    }
  };

  return (
    <section id="the-draw" className="py-20 lg:py-32 bg-background-soft/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="flex justify-center mb-4">
            <Badge variant="gold">HOW THE DRAW WORKS</Badge>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-charcoal tracking-tight leading-[1.15] mb-6">
            Five simple steps from <br />
            <span className="italic text-charcoal-deep">fairway to monthly draw.</span>
          </h2>
          <p className="text-charcoal-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Designed for golf enthusiasts, not gamblers. Transparent, mathematically verified, and driven by your authentic rounds on the course.
          </p>
        </div>

        {/* 5-Step Process Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
          {DRAW_STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="relative flex flex-col h-full"
            >
              <Card className="flex flex-col justify-between h-full p-5 lg:p-6 bg-white border-sand-200/90 hover:border-sage-300 transition-all group">
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sand-100 text-charcoal-muted">
                      STEP {step.number}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sand-50 border border-sand-200 group-hover:bg-sage-50 group-hover:border-sage-200 flex items-center justify-center transition-colors">
                      {getStepIcon(step.number)}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-sans font-bold text-base text-charcoal mb-2 tracking-tight">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                {/* Highlight Tag */}
                {step.highlight && (
                  <div className="pt-3 border-t border-sand-100 flex items-center gap-1.5 text-[11px] font-semibold text-sage-800">
                    <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>{step.highlight}</span>
                  </div>
                )}
              </Card>

              {/* Desktop connecting arrow / indicator between steps */}
              {idx < DRAW_STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-sand-400">
                  <div className="w-2 h-2 rounded-full bg-sand-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Integrity & PRD Clarification Callout */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white p-6 sm:p-8 border border-sand-200 shadow-subtle flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-700 flex items-center justify-center shrink-0 border border-sage-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-sans font-bold text-sm sm:text-base text-charcoal mb-1">
              Cryptographic Transparency & Fair Algorithms
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Draw numbers correspond to the standard 1–45 range matching valid Stableford point scores. Golf-Hero utilizes provably fair algorithmic selection, ensuring verified integrity with zero bias and immediate public audit logs.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
