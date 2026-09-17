import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActiveMemberDashboard } from '../components/dashboard/ActiveMemberDashboard';
import { NonMemberDashboard } from '../components/dashboard/NonMemberDashboard';
import { Loader2 } from 'lucide-react';

/**
 * Status-Driven Dashboard Router
 * 
 * Determines whether to render ActiveMemberDashboard (with DEMO badge if demo mode)
 * or NonMemberDashboard based on user.membershipStatus and user.membershipMode.
 */
export const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading, membershipStatus, membershipMode } = useAuth();

  // Handle loading session check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-charcoal">
          <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
          <p className="text-xs uppercase tracking-wider font-mono font-bold">Verifying Session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated at all, redirect to account creation/sign in step
  if (!isAuthenticated) {
    return <Navigate to="/join/account" replace />;
  }

  // STATUS-DRIVEN ARCHITECTURE
  if (membershipStatus === 'active') {
    return <ActiveMemberDashboard isDemo={membershipMode === 'demo'} />;
  }

  // Non-member or pending activation
  return <NonMemberDashboard />;
};

export default Dashboard;
