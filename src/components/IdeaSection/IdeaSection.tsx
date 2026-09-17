import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, HeartHandshake, ArrowRight } from 'lucide-react';
import { IDEA_STEPS } from '../../data/content';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const IdeaSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target':
        return <Target className="w-6 h-6 text-sage-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-gold-500" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-sage-600" />;
      default:
        return <Target className="w-6 h-6 text-sage-600" />;
    }
  };

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background-soft/60 relative">
      {/* Decorative hairline divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <div className="flex justify-center mb-4">
          <Badge variant="outline">THE CONCEPT</Badge>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal tracking-tight max-w-2xl mx-auto leading-tight mb-5">
          A modern cycle of <br />
          <span className="italic text-sage-700">play, reward, and purpose.</span>
        </h2>
        <p className="text-charcoal-muted text-base sm:text-lg max-w-xl mx-auto">
          Digital Heroes seamlessly unites your love for the game with the excitement of monthly draws and tangible real-world giving.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {IDEA_STEPS.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card
                hoverEffect
                className="h-full flex flex-col justify-between relative overflow-hidden group bg-white border-sand-200"
              >
                {/* Subtle top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sage-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top row: Number and Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-3xl sm:text-4xl font-light text-sand-400 group-hover:text-sage-600 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-sand-50 group-hover:bg-sage-50 border border-sand-200 group-hover:border-sage-200 flex items-center justify-center transition-colors">
                      {getIcon(item.iconName)}
                    </div>
                  </div>

                  {/* Headings */}
                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-widest text-charcoal-light font-bold">
                      {item.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal mt-1 tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-charcoal-muted text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom link cue */}
                <div className="pt-8 mt-6 border-t border-sand-100 flex items-center justify-between text-xs font-semibold tracking-wider text-sage-700 uppercase">
                  <span>Explore Pillar</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
