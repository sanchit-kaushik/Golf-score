import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

export const HeroFloatingCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Soft ambient backlight */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-sage-300/40 via-gold-300/30 to-sand-300/40 rounded-3xl blur-xl opacity-75" />

      {/* Main Glass Card */}
      <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl p-6 sm:p-7 border border-sand-200/90 shadow-elevated">
        
        {/* Header telemetry */}
        <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sage-50 text-sage-700 flex items-center justify-center border border-sage-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-charcoal-muted font-bold">Member Scorecard</p>
              <p className="text-sm font-bold text-charcoal">Round verified • St. Andrews Old</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-800 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
            Stableford 39
          </span>
        </div>

        {/* 5-Number active draw preview */}
        <div className="bg-sand-50/80 rounded-xl p-3.5 border border-sand-200/70 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-charcoal-muted tracking-wider uppercase text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              Monthly Draw Entry Numbers
            </span>
            <span className="text-[10px] text-charcoal-muted font-medium">Auto-derived</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {['07', '18', '24', '33', '39'].map((num, i) => (
              <div
                key={i}
                className={`py-2 text-center rounded-lg font-mono font-bold text-sm tracking-tight border transition-all ${
                  i === 4
                    ? 'bg-gold-50 text-gold-700 border-gold-300 shadow-sm'
                    : 'bg-white text-charcoal border-sand-200'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Charity Contribution Pill */}
        <div className="flex items-center justify-between bg-gradient-to-r from-sage-50/90 to-background rounded-xl p-3.5 border border-sage-200/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sage-500 text-white flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal">Youth Horizons in Sport</p>
              <p className="text-[11px] text-sage-700 font-medium">10% subscription pledge active</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-sage-800 bg-white px-2 py-1 rounded-md border border-sage-200">
            Pledged
          </span>
        </div>

      </div>

      {/* Floating Pill Badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 bg-charcoal text-white px-4 py-2.5 rounded-full shadow-elevated border border-charcoal/30 text-xs font-semibold"
      >
        <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
        <span>Ethical Play & Community Verified</span>
      </motion.div>
    </motion.div>
  );
};
