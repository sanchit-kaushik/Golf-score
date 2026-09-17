import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Award, Heart, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { HeroFloatingCard } from './HeroFloatingCard';

export const Hero: React.FC = () => {
  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
      {/* Background ambient radial blurs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-sage-100/60 via-sand-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-gold-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Messaging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Top pill badge */}
            <Badge variant="sage" className="mb-6 py-1.5 px-3.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-600 animate-ping mr-1" />
              GOLF • CHANCE • CHARITY
            </Badge>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-normal tracking-tight text-charcoal leading-[1.08] mb-6">
              Play for more than <br />
              <span className="italic font-light text-sage-700">the score.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="font-sans text-base sm:text-lg text-charcoal-muted max-w-xl leading-relaxed mb-8">
              Play your game. Enter your scores. Take part in monthly draws. Have a chance to win. Support a charity you care about.
            </p>

            {/* Pillar highlight badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-9 text-xs sm:text-sm font-medium text-charcoal-muted">
              <div className="flex items-center gap-1.5 bg-sand-100/80 px-3 py-1.5 rounded-lg border border-sand-200/80">
                <Award className="w-4 h-4 text-sage-700" />
                <span>Stableford Score Tracking</span>
              </div>
              <div className="flex items-center gap-1.5 bg-sand-100/80 px-3 py-1.5 rounded-lg border border-sand-200/80">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>Monthly Number Draws</span>
              </div>
              <div className="flex items-center gap-1.5 bg-sand-100/80 px-3 py-1.5 rounded-lg border border-sand-200/80">
                <Heart className="w-4 h-4 text-sage-600" />
                <span>10%+ Pledged to Charity</span>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link to="/join">
                <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                  <span>JOIN THE CLUB</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto border-charcoal/20 hover:border-charcoal/40 text-charcoal"
              >
                SEE HOW IT WORKS
              </Button>
            </div>

            {/* Micro reassurance label */}
            <div className="mt-8 flex items-center gap-3 text-xs text-charcoal-light">
              <span className="w-2 h-2 rounded-full bg-sage-500" />
              <span>Transparent draw mechanisms & verified charity contributions</span>
            </div>
          </motion.div>

          {/* Right Column: Visual Composition with Human-Centered Lifestyle & Live Telemetry */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Elegant human-centered lifestyle image background container */}
            <div className="relative w-full max-w-lg aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated border border-sand-200/90 group">
              <img
                src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=85"
                alt="Golfer at sunrise focused with purpose"
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              
              {/* Soft gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />

              {/* Bottom lifestyle caption */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="font-serif italic text-xl sm:text-2xl font-light text-sand-50 mb-1">
                  “Every shot carries meaning.”
                </p>
                <p className="text-xs uppercase tracking-widest text-sand-200 font-semibold">
                  A new tradition in golf
                </p>
              </div>
            </div>

            {/* Overlapping Floating Telemetry Card */}
            <div className="w-full -mt-20 sm:-mt-24 px-2 sm:px-4 z-20">
              <HeroFloatingCard />
            </div>

          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={scrollToHowItWorks}
            className="flex flex-col items-center gap-1.5 text-xs text-charcoal-light hover:text-charcoal transition-colors group cursor-pointer"
            aria-label="Scroll to learn more"
          >
            <span className="tracking-widest uppercase font-medium text-[10px]">Discover the concept</span>
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-1 text-sage-600" />
          </button>
        </div>

      </div>
    </section>
  );
};
