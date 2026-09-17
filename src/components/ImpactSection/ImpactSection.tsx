import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Trophy, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const ImpactSection: React.FC = () => {
  return (
    <section id="about" className="py-24 lg:py-36 bg-charcoal text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-sage-800/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-gold-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brand Story Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-xs uppercase tracking-[0.25em] font-mono text-sage-400 font-bold block mb-4">
            BRAND MANIFESTO
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08] mb-8">
            Your game can go <br />
            <span className="italic text-sand-200">so much further.</span>
          </h2>
          <p className="text-sand-300 text-lg sm:text-xl font-light leading-relaxed max-w-2xl">
            For generations, the joy of golf ended when the ball dropped on the 18th green. We believe every swing can resonate beyond the clubhouse.
          </p>
        </div>

        {/* The 3-Step Emotional Flow: YOUR GAME -> YOUR CHANCE -> YOUR IMPACT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 relative border-t border-white/15 pt-12">
          
          {/* Step 1: YOUR GAME */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs font-bold text-sage-400 bg-white/10 px-2.5 py-1 rounded-full">
                  STAGE 01
                </span>
                <Flag className="w-5 h-5 text-sage-400" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-4">
                Your Game
              </h3>
              <p className="text-sand-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                The morning frost, the crisp iron strike, the quiet concentration over a ten-foot putt. You continue playing the sport you cherish at any club or fairway you choose.
              </p>
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-sand-400">
              Personal Mastery & Passion
            </div>
          </motion.div>

          {/* Step 2: YOUR CHANCE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/15 pt-8 lg:pt-0 lg:pl-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs font-bold text-gold-400 bg-white/10 px-2.5 py-1 rounded-full">
                  STAGE 02
                </span>
                <Trophy className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-4">
                Your Chance
              </h3>
              <p className="text-sand-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                Your Stableford score isn’t just recorded in a notebook. It unlocks entry into our monthly member draw, bringing genuine anticipation and rolling prize pools to everyday golfers.
              </p>
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-sand-400">
              Thrill & Member Rewards
            </div>
          </motion.div>

          {/* Step 3: YOUR IMPACT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/15 pt-8 lg:pt-0 lg:pl-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs font-bold text-sage-400 bg-white/10 px-2.5 py-1 rounded-full">
                  STAGE 03
                </span>
                <Heart className="w-5 h-5 text-sage-400 fill-sage-400" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-4">
                Your Impact
              </h3>
              <p className="text-sand-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                Whether you win the jackpot or missed by a stroke, your participation empowers grassroots causes. From junior academies to green land conservation, you make a difference.
              </p>
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-sand-400">
              Community Legacy
            </div>
          </motion.div>

        </div>

        {/* Editorial Quote Card */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="font-serif italic text-2xl sm:text-3xl text-sand-100 font-light leading-snug">
              “Feel, not fairway. When players step onto the course knowing their round supports someone in need, every shot carries dignity.”
            </p>
            <p className="text-xs font-mono tracking-widest uppercase text-sage-400 mt-4 font-bold">
              The Digital Heroes Creed
            </p>
          </div>
          <Link to="/join" className="shrink-0">
            <Button variant="gold" size="lg" className="shadow-gold-glow">
              <span>EXPLORE MEMBERSHIP</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};
