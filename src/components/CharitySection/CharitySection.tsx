import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sliders, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { FEATURED_CHARITIES } from '../../data/content';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const CharitySection: React.FC = () => {
  const [selectedCharity, setSelectedCharity] = useState(FEATURED_CHARITIES[0]);
  const [pledgePercent, setPledgePercent] = useState<number>(10);
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);

  return (
    <section id="charities" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Subtle background ambient touch */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-sage-50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="flex justify-center mb-4">
            <Badge variant="sage">PURPOSE-DRIVEN MEMBERSHIP</Badge>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-charcoal tracking-tight leading-[1.15] mb-6">
            Every game can give <br />
            <span className="italic text-sage-700">something back.</span>
          </h2>
          <p className="text-charcoal-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Golf has always been a game of honor and community. With Golf-Hero, you choose a certified cause, and at least 10% of your regular membership fee is contributed directly in your name.
          </p>
        </div>

        {/* Interactive Charity Showcase & Editorial Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Emotional Visual + Storytelling */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-sand-200 aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={selectedCharity.imageUrl}
                alt={selectedCharity.name}
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              
              {/* Overlay Content */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wider uppercase mb-2">
                  {selectedCharity.category}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mb-2">
                  {selectedCharity.name}
                </h3>
                <p className="text-xs sm:text-sm text-sand-100 line-clamp-2 max-w-lg">
                  {selectedCharity.summary}
                </p>
              </div>
            </div>

            {/* Micro Transparency Callout */}
            <div className="mt-4 flex items-center justify-between text-xs text-charcoal-light px-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sage-600" />
                100% auditable contribution trail
              </span>
              <span className="italic">Sample Partner Preview</span>
            </div>
          </div>

          {/* Right: How Charity Contribution Works (PRD Specs) */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            
            {/* PRD Highlights Card */}
            <div className="rounded-2xl bg-background-soft p-6 sm:p-8 border border-sand-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sage-500 text-white flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-medium text-charcoal">Your Impact, Your Choice</h4>
                  <p className="text-xs uppercase tracking-wider text-charcoal-muted">Simple, transparent, personal</p>
                </div>
              </div>

              {/* Requirements breakdown */}
              <div className="space-y-4 text-sm text-charcoal">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-charcoal">Select Your Charity:</strong> Browse verified grassroots and national causes across youth athletics, environmental conservation, and adaptive sports.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-charcoal">Automatic 10% Minimum:</strong> Every active membership automatically pledges at least 10% of the subscription straight to your cause.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="font-semibold text-charcoal">Voluntary Giving Boost:</strong> Members can flexibly adjust their contribution percentage or make independent one-off donations anytime.
                  </div>
                </div>
              </div>

              {/* Interactive Contribution Demonstration Slider */}
              <div className="mt-8 pt-6 border-t border-sand-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sage-600" />
                    Interactive Pledge Simulator
                  </span>
                  <span className="font-mono text-sm font-bold text-sage-700 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
                    {pledgePercent}% of subscription
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={pledgePercent}
                  onChange={(e) => setPledgePercent(Number(e.target.value))}
                  className="w-full accent-sage-600 cursor-pointer h-2 bg-sand-200 rounded-lg appearance-none"
                  aria-label="Adjust demonstration pledge percentage"
                />
                <div className="flex justify-between text-[10px] text-charcoal-light font-mono mt-1">
                  <span>10% (Required minimum)</span>
                  <span>25%</span>
                  <span>50% (Heroic tier)</span>
                </div>
              </div>

            </div>

            {/* Selectable Preview Causes */}
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-charcoal-muted mb-3">
                Featured Cause Initiatives (Click to preview)
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {FEATURED_CHARITIES.map((cause) => (
                  <button
                    key={cause.id}
                    onClick={() => setSelectedCharity(cause)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedCharity.id === cause.id
                        ? 'bg-sage-50 border-sage-500 shadow-sm'
                        : 'bg-white border-sand-200 hover:border-sand-300'
                    }`}
                  >
                    <p className="font-bold text-charcoal truncate">{cause.name}</p>
                    <p className="text-[10px] text-sage-700 truncate mt-0.5">{cause.tag}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Explore Charities CTA Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDirectoryModal(true)}
                className="w-full sm:w-auto border-charcoal/25 hover:border-charcoal text-charcoal group"
              >
                <span>EXPLORE CHARITIES</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

          </div>

        </div>

      </div>

      {/* Explore Charities Preview Modal */}
      {showDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated border border-sand-200 relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-sage-700 font-bold">Directory Preview</span>
                <h3 className="font-serif text-2xl font-normal text-charcoal">Public Charity Directory</h3>
              </div>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="text-charcoal-muted hover:text-charcoal p-2 rounded-full hover:bg-sand-100 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-charcoal-muted text-sm mb-6">
              As a Golf-Hero member, you can allocate your contribution to any of our certified non-profit partners or suggest a new local golf or community initiative for onboard verification.
            </p>

            <div className="space-y-4 mb-8">
              {FEATURED_CHARITIES.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-sand-200 bg-background-soft flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full font-semibold">
                      {c.tag}
                    </span>
                    <h4 className="font-bold text-charcoal text-sm mt-1">{c.name}</h4>
                    <p className="text-xs text-charcoal-muted mt-1">{c.summary}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">Verified Cause</Badge>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-sand-100">
              <Button variant="primary" size="md" onClick={() => setShowDirectoryModal(false)}>
                Close Preview
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </section>
  );
};
