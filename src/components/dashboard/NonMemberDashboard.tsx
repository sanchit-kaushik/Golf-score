import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, LogOut, Lock, 
  Target, Sparkles, Heart, Trophy, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJoin } from '../../context/JoinContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const NonMemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedPlan } = useJoin();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-charcoal flex flex-col selection:bg-sage-200 selection:text-sage-900">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sand-200/90 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              <span className="font-serif italic font-normal text-base text-gold-400">G</span>
              <span className="font-sans font-bold text-[11px] -ml-0.5 text-white">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-extrabold tracking-widest text-sm text-charcoal leading-none">
                GOLF-HERO
              </span>
              <span className="text-[10px] tracking-wider uppercase text-charcoal-muted mt-0.5 font-medium">
                Account Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-charcoal">{user?.fullName || 'Golfer'}</span>
              <span className="text-[10px] text-amber-700 font-mono font-semibold">Membership Not Active</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand-100 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        
        {/* Top Activation Callout Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-sand-50 via-white to-sand-50 p-6 sm:p-8 border border-sand-200 shadow-card mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] font-mono text-amber-800 border-amber-300 bg-amber-50">
                  MEMBERSHIP NOT ACTIVE
                </Badge>
                <span className="text-xs text-charcoal-light">Step 04 Incomplete</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
                Hello, {user?.fullName || 'Golfer'}. Your account is ready.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-xl leading-relaxed">
                You have created your golfer credentials, but your active membership subscription has not yet been finalized. Activate now via Razorpay or Demo Access to unlock full subscriber features.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link to="/join/payment" className="block w-full">
              <Button variant="primary" size="lg" className="w-full justify-center group shadow-elevated">
                <span>COMPLETE ACTIVATION</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Basic Account Information Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <Card className="p-6 bg-white border-sand-200">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-charcoal-light font-bold mb-2">
              <UserCheck className="w-4 h-4 text-sage-600" />
              Golfer Profile
            </div>
            <p className="font-serif text-xl font-bold text-charcoal truncate">
              {user?.fullName || 'Golfer'}
            </p>
            <p className="text-xs text-charcoal-muted mt-1 truncate">
              {user?.email || 'golfer@example.com'}
            </p>
          </Card>

          <Card className="p-6 bg-white border-sand-200">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-charcoal-light font-bold mb-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              Selected Plan
            </div>
            <p className="font-serif text-xl font-bold text-charcoal">
              {selectedPlan?.name || 'Annual Membership'}
            </p>
            <p className="text-xs text-charcoal-muted mt-1">
              ${selectedPlan?.price || 279} / {selectedPlan?.billingPeriod || 'year'}
            </p>
          </Card>

          <Card className="p-6 bg-white border-sand-200">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-charcoal-light font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              Account Status
            </div>
            <p className="font-serif text-xl font-bold text-amber-800">
              Pending Activation
            </p>
            <p className="text-xs text-charcoal-muted mt-1">
              Payment required for draw eligibility
            </p>
          </Card>

        </div>

        {/* What Active Members Unlock (PRD Feature Breakdown) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
              What You Unlock With Membership
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1.5">
              Golf-Hero combines golf performance, monthly number draws, and philanthropic contributions into a unified subscriber dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            
            <Card className="p-5 bg-white/90 border-sand-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-sage-600" />
              </div>
              <h4 className="font-bold text-sm text-charcoal mb-1">
                Stableford Tracking
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Log your latest 5 rounds (range 1–45). Auto-rotates your newest round into active draw tickets.
              </p>
            </Card>

            <Card className="p-5 bg-white/90 border-sand-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-gold-500" />
              </div>
              <h4 className="font-bold text-sm text-charcoal mb-1">
                Monthly Draws
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Automatic entry into monthly number draws with 5-number, 4-number, and 3-number prize tiers.
              </p>
            </Card>

            <Card className="p-5 bg-white/90 border-sand-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center mb-3">
                <Heart className="w-5 h-5 text-sage-600" />
              </div>
              <h4 className="font-bold text-sm text-charcoal mb-1">
                Charity Impact
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                At least 10% of your membership fee is pledged directly to your chosen grassroots partner.
              </p>
            </Card>

            <Card className="p-5 bg-white/90 border-sand-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-gold-500" />
              </div>
              <h4 className="font-bold text-sm text-charcoal mb-1">
                Prize Verification
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Audit provably fair algorithmic draws, upload scorecard proof, and review tier disbursements.
              </p>
            </Card>

          </div>

          {/* Action to Finish Onboarding */}
          <div className="text-center">
            <Link to="/join/payment">
              <Button variant="primary" size="lg" className="shadow-card">
                <span>CHOOSE PAYMENT OR DEMO ACCESS</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 bg-white/50 py-6 text-center text-xs text-charcoal-muted">
        Golf-Hero — Non-Member Account Dashboard
      </footer>

    </div>
  );
};
