import { Heart, Sparkles } from 'lucide-react';

export const CharityCallout: React.FC = () => {
  return (
    <div className="mt-8 rounded-3xl bg-gradient-to-r from-sage-50 via-sand-50 to-sage-50/50 p-6 sm:p-8 border border-sage-200/90 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sage-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Heart className="w-6 h-6 fill-white" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sage-800 bg-sage-100/80 px-2.5 py-0.5 rounded-full">
            Charity Commitment
          </span>
          <h4 className="font-serif text-xl sm:text-2xl font-normal text-charcoal mt-1.5 mb-1">
            Membership isn't just about the game.
          </h4>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl leading-relaxed">
            Choose a cause you care about and direct part of your membership toward it. Under our charter, a minimum of 10% of your subscription fee is pledged directly to your designated charity, with the ability to voluntarily boost your contribution.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white/90 px-4 py-2.5 rounded-2xl border border-sage-200 shrink-0 text-xs font-semibold text-sage-900 shadow-sm">
        <Sparkles className="w-4 h-4 text-gold-500" />
        <span>Select your charity in Step 03</span>
      </div>
    </div>
  );
};
