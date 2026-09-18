import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { MembershipProgress } from '../membership/MembershipProgress';

interface JoinLayoutProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
}

export const JoinLayout: React.FC<JoinLayoutProps> = ({ currentStep, children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-sage-200 selection:text-sage-900">
      {/* Top Header */}
      <header className="border-b border-sand-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Back to Home */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-charcoal hover:text-sage-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Exit</span>
          </Link>

          {/* Centered Brand Monogram */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              <span className="font-serif italic font-normal text-base text-gold-400">G</span>
              <span className="font-sans font-bold text-[11px] -ml-0.5 text-white">H</span>
            </div>
            <span className="font-sans font-extrabold tracking-widest text-sm text-charcoal leading-none">
              GOLF-HERO
            </span>
          </Link>

          {/* Secure Reassurance Badge */}
          <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-medium">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            <span className="hidden sm:inline">256-bit Encrypted</span>
          </div>

        </div>
      </header>

      {/* Main Flow Container with Stepper */}
      <main className="flex-grow flex flex-col">
        <MembershipProgress currentStep={currentStep} />
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
          {children}
        </div>
      </main>

      {/* Clean Flow Footer */}
      <footer className="border-t border-sand-200 bg-white/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-muted">
          <div>
            Golf-Hero Membership Onboarding — Step {currentStep} of 5
          </div>
          <div className="flex items-center gap-4">
            <span>Minimum 10% Charity Guarantee</span>
            <span>•</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
