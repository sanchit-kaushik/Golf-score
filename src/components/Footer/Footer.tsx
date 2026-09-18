import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ArrowUpRight, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [legalModalContent, setLegalModalContent] = useState<string | null>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/' + href);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-charcoal-deep text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-white text-charcoal flex items-center justify-center font-bold text-base tracking-wider shadow-sm group-hover:bg-sage-200 transition-colors">
                <span className="font-serif italic font-normal text-lg text-sage-800">G</span>
                <span className="font-sans font-bold text-xs -ml-0.5 text-charcoal">H</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-extrabold tracking-widest text-base text-white leading-none">
                  GOLF-HERO
                </span>
                <span className="text-[10px] tracking-wider uppercase text-sand-300 mt-0.5 font-medium">
                  Play For More Than The Score
                </span>
              </div>
            </Link>

            <p className="text-sand-300 text-sm max-w-sm leading-relaxed mb-6 font-light">
              A modern lifestyle platform combining verified golf performance, monthly draw rewards, and meaningful philanthropic contributions.
            </p>

            {/* Micro Social icons placeholders */}
            <div className="flex items-center gap-3">
              {['Instagram', 'X / Twitter', 'LinkedIn', 'YouTube'].map((network) => (
                <button
                  key={network}
                  onClick={() => alert(`${network} link is a demo placeholder.`)}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-sand-200 transition-colors cursor-pointer"
                >
                  {network}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-sage-400 font-bold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-sand-300">
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleNavClick(e, '#how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#charities"
                  onClick={(e) => handleNavClick(e, '#charities')}
                  className="hover:text-white transition-colors"
                >
                  Charities & Impact
                </a>
              </li>
              <li>
                <a
                  href="#the-draw"
                  onClick={(e) => handleNavClick(e, '#the-draw')}
                  className="hover:text-white transition-colors"
                >
                  The Monthly Draw
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick(e, '#about')}
                  className="hover:text-white transition-colors"
                >
                  About & Manifesto
                </a>
              </li>
              <li>
                <Link to="/join" className="text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1 transition-colors">
                  <span>Join the Club</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Integrity */}
          <div className="md:col-span-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-sage-400 font-bold mb-4">
              Ethical Standards
            </h4>
            <p className="text-sand-300 text-xs leading-relaxed mb-4 font-light">
              Golf-Hero operates under strict standards of game integrity, cryptographic random generation for all monthly draws, and 100% verified non-profit disbursements.
            </p>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs text-sand-200">
              <Shield className="w-4 h-4 text-sage-400 shrink-0" />
              <span>Independent draw logs published every monthly cycle.</span>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-400">
          <div className="flex items-center gap-1 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Golf-Hero. All rights reserved. Built with</span>
            <Heart className="w-3.5 h-3.5 text-sage-400 inline mx-0.5 fill-sage-400" />
            <span>for golfers and communities.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setLegalModalContent('privacy')}
              className="hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setLegalModalContent('terms')}
              className="hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>

      </div>

      {/* Legal Dialog Modal */}
      {legalModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-charcoal">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-elevated border border-sand-200">
            <h3 className="font-serif text-2xl font-bold mb-3">
              {legalModalContent === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6 max-h-60 overflow-y-auto pr-2">
              {legalModalContent === 'privacy' ? (
                <>
                  At Golf-Hero, your privacy and data sovereignty are paramount. We collect golf round scores solely for draw calculation and member verification. Scorecards and proof uploads are encrypted and handled in strict adherence to data protection standards.
                </>
              ) : (
                <>
                  Golf-Hero operates as a skill-based golf performance subscription platform. Scores entered must reflect genuine rounds played under standard rules. A minimum of 10% of subscription proceeds are allocated to verified charitable partners according to member designation.
                </>
              )}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setLegalModalContent(null)}
                className="px-5 py-2 bg-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-charcoal-deep transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
