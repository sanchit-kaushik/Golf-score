import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Charities', href: '#charities' },
    { label: 'The Draw', href: '#the-draw' },
    { label: 'About', href: '#about' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/' + href);
      return;
    }
    // If on homepage, smooth scroll to anchor
    const element = document.querySelector(href);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-sand-200/80 shadow-subtle py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold text-base tracking-wider shadow-sm group-hover:bg-sage-800 transition-colors">
              <span className="font-serif italic font-normal text-lg text-gold-400">D</span>
              <span className="font-sans font-bold text-xs -ml-0.5 text-white">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-extrabold tracking-widest text-sm sm:text-base text-charcoal leading-none">
                DIGITAL HEROES
              </span>
              <span className="text-[10px] tracking-wider uppercase text-charcoal-muted mt-0.5 font-medium">
                Golf • Chance • Charity
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xs lg:text-sm font-medium tracking-wide text-charcoal-muted hover:text-charcoal transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage-600 hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Primary CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold uppercase tracking-wider text-charcoal hover:text-[#2C4C38] px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link to="/join">
              <Button variant="primary" size="md" className="group">
                <span>JOIN THE CLUB</span>
                <ArrowUpRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal hover:bg-sand-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-background/98 backdrop-blur-xl border-b border-sand-200 shadow-elevated px-6 py-8 transition-all">
          <div className="flex flex-col space-y-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base font-semibold text-charcoal hover:text-sage-700 py-2 border-b border-sand-100 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Link to="/login" className="block w-full text-center py-2.5 text-sm font-bold uppercase tracking-wider text-charcoal hover:bg-sand-100 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/join" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="lg" className="w-full justify-center">
                  <span>JOIN THE CLUB</span>
                  <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
