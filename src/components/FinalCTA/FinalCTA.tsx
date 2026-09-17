import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '../ui/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 lg:py-36 bg-background relative overflow-hidden">
      {/* Soft ambient background circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-sage-100/70 via-sand-100/50 to-gold-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-50 text-sage-800 border border-sage-200 text-xs font-semibold uppercase tracking-widest mb-6">
            <Heart className="w-3.5 h-3.5 fill-sage-600 text-sage-600" />
            <span>Join the Movement</span>
          </div>

          {/* Large Headline */}
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-charcoal leading-[1.1] mb-6">
            Ready to play with <br />
            <span className="italic text-sage-700">purpose?</span>
          </h2>

          {/* Supporting Copy */}
          <p className="text-charcoal-muted text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Join a community where every game has the chance to create something bigger. Play your round, enter your scores, and give back with every swing.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/join">
              <Button variant="primary" size="lg" className="px-10 py-4 text-base shadow-elevated group">
                <span>JOIN THE CLUB</span>
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Guarantee Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-muted font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-600" />
              <span>Easy Onboarding</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>Provably Fair Monthly Draws</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-sage-600" />
              <span>Direct Charity Impact</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
