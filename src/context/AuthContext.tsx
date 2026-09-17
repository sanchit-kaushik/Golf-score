import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, MembershipStatus, MembershipMode, GolfScore } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  membershipStatus: MembershipStatus;
  membershipMode: MembershipMode;
  scores: GolfScore[];
  totalScoreCount: number;
  selectedCharityId: string;
  charityPledgePercent: number;
  luckyNumbers: number[];
  signup: (fullName: string, email: string, password?: string, planId?: 'monthly' | 'yearly' | null) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  activateMembership: (planId: 'monthly' | 'yearly', mode?: 'real' | 'demo') => Promise<{ success: boolean; error?: string }>;
  verifyPayment: (data: {
    planId: 'monthly' | 'yearly';
    razorpay_order_id?: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    razorpay_subscription_id?: string;
    charityId?: string;
    charityPledgePercent?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  cancelMembership: () => void;
  addScore: (score: number, date: string, courseName?: string) => Promise<{ success: boolean; error?: string }>;
  editScore: (id: string, score?: number, date?: string, courseName?: string) => Promise<{ success: boolean; error?: string }>;
  deleteScore: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshScores: () => Promise<void>;
  updateCharity: (charityId: string, pledgePercent: number) => Promise<{ success: boolean; error?: string }>;
}

const SCORES_STORAGE_KEY = 'dh_member_scores';
const CHARITY_STORAGE_KEY = 'dh_member_charity';

// Default initial 5 verified Stableford scores for active member demo
const DEFAULT_SCORES: GolfScore[] = [
  { id: 'sc_1', score: 39, date: '2026-09-14', courseName: 'St. Andrews Old Course' },
  { id: 'sc_2', score: 35, date: '2026-09-08', courseName: 'Carnoustie Championship' },
  { id: 'sc_3', score: 41, date: '2026-08-30', courseName: 'Royal County Down' },
  { id: 'sc_4', score: 36, date: '2026-08-22', courseName: 'Muirfield Links' },
  { id: 'sc_5', score: 38, date: '2026-08-15', courseName: 'Sunwille Heath Course' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Scores state
  const [scores, setScores] = useState<GolfScore[]>(() => {
    try {
      const saved = localStorage.getItem(SCORES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SCORES;
  });

  const [totalScoreCount, setTotalScoreCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SCORES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.length : DEFAULT_SCORES.length;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SCORES.length;
  });

  const refreshScores = async () => {
    try {
      const res = await api.scores.getAll();
      if (res.success && Array.isArray(res.scores)) {
        setScores(res.scores);
        setTotalScoreCount(res.totalCount);
        localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(res.scores));
      }
    } catch (_err) {
      // Keep existing local/demo scores
    }
  };

  // Charity state
  const [selectedCharityId, setSelectedCharityId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CHARITY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.charityId || 'youth-golf';
      }
    } catch {
      // ignore
    }
    return 'youth-golf';
  });

  const [charityPledgePercent, setCharityPledgePercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CHARITY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.pledgePercent || 10;
      }
    } catch {
      // ignore
    }
    return 10;
  });

  // Restore authenticated session from backend via GET /api/auth/me
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const res = await api.auth.getMe();
        if (isMounted && res.success && res.user) {
          setUser({
            ...res.user,
            isMembershipActive: res.user.membershipStatus === 'active',
          });
          if (res.user.selectedCharity) {
            setSelectedCharityId(res.user.selectedCharity);
          }
          if (res.user.charityContributionPercentage) {
            setCharityPledgePercent(res.user.charityContributionPercentage);
          }
          refreshScores();
        } else if (isMounted) {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistScores = (newScores: GolfScore[]) => {
    setScores(newScores);
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(newScores));
  };

  /**
   * Real backend registration:
   * Calls POST /api/auth/register
   * Starts with membershipStatus = 'none' (ACCOUNT CREATED != MEMBERSHIP ACTIVE)
   * Automatically sets user in session.
   */
  const signup = async (
    fullName: string,
    email: string,
    password?: string,
    planId?: 'monthly' | 'yearly' | null
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(fullName, email, password || '', planId);
      if (res.success && res.user) {
        setUser({
          ...res.user,
          isMembershipActive: res.user.membershipStatus === 'active',
        });
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: res.message || 'Registration failed' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed. Please try again.' };
    }
  };

  /**
   * Real backend login:
   * Calls POST /api/auth/login
   */
  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password || '');
      if (res.success && res.user) {
        setUser({
          ...res.user,
          isMembershipActive: res.user.membershipStatus === 'active',
        });
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: res.message || 'Login failed' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed. Please verify credentials.' };
    }
  };

  /**
   * Real backend logout:
   * Calls POST /api/auth/logout
   */
  const logout = async (): Promise<void> => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  /**
   * Backend demo activation:
   * Calls POST /api/membership/demo
   * Updates MongoDB document to membershipStatus = 'active', membershipMode = 'demo'
   */
  const activateMembership = async (
    planId: 'monthly' | 'yearly',
    mode: 'real' | 'demo' = 'demo'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (mode === 'demo') {
        const res = await api.membership.activateDemo(planId);
        if (res.success && res.user) {
          setUser({
            ...res.user,
            isMembershipActive: true,
            membershipStatus: 'active',
            membershipMode: 'demo',
            membershipPlanId: planId,
          });
          return { success: true };
        }
        return { success: false, error: res.message || 'Failed to activate demo membership.' };
      }

      // Real membership cannot be activated without cryptographic Razorpay verification
      return {
        success: false,
        error: 'Real membership activation requires verified Razorpay payment. Please complete checkout.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to activate membership.' };
    }
  };

  /**
   * Real Razorpay Payment Verification:
   * Sends signature & payment ID to POST /api/payments/verify
   * Backend verifies HMAC-SHA256 signature against RAZORPAY_KEY_SECRET
   * Only activates membership if verification succeeds!
   */
  const verifyPayment = async (data: {
    planId: 'monthly' | 'yearly';
    razorpay_order_id?: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    razorpay_subscription_id?: string;
    charityId?: string;
    charityPledgePercent?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.payments.verify(data);
      if (res.success && res.user) {
        setUser({
          ...res.user,
          isMembershipActive: true,
          membershipStatus: 'active',
          membershipMode: 'real',
          membershipPlanId: data.planId,
        });
        return { success: true };
      }
      return { success: false, error: 'Signature verification rejected by server.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Payment verification failed.' };
    }
  };

  const cancelMembership = () => {
    if (user) {
      setUser({
        ...user,
        isMembershipActive: false,
        membershipStatus: 'cancelled',
      });
    }
  };

  const addScore = async (
    score: number,
    date: string,
    courseName: string = 'Verified Course Round'
  ): Promise<{ success: boolean; error?: string }> => {
    if (score < 1 || score > 45) {
      return { success: false, error: 'Stableford score must be between 1 and 45 points.' };
    }
    if (!date) {
      return { success: false, error: 'Date is required for verified round submission.' };
    }

    try {
      const res = await api.scores.create(score, date, courseName);
      if (res.success && res.scores) {
        setScores(res.scores);
        setTotalScoreCount(res.totalCount);
        localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(res.scores));
        return { success: true };
      }
      return { success: false, error: res.message || 'Failed to record round score.' };
    } catch (err: any) {
      const errMsg = err?.message || 'Error saving score.';
      // Fallback if offline/demo network error
      if (errMsg.includes('HTTP error') || errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
        const dateExists = scores.some((s) => s.date === date);
        if (dateExists) {
          return { success: false, error: `You already have a score recorded for ${date}. Only one score per date is allowed.` };
        }
        const newEntry: GolfScore = {
          id: `sc_${Date.now()}`,
          score,
          date,
          courseName,
        };
        const combined = [newEntry, ...scores].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const trimmed = combined.slice(0, 5);
        persistScores(trimmed);
        setTotalScoreCount(combined.length);
        return { success: true };
      }
      return { success: false, error: errMsg };
    }
  };

  const editScore = async (
    id: string,
    score?: number,
    date?: string,
    courseName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.scores.update(id, score, date, courseName);
      if (res.success && res.scores) {
        setScores(res.scores);
        setTotalScoreCount(res.totalCount);
        localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(res.scores));
        return { success: true };
      }
      return { success: false, error: res.message || 'Failed to update score.' };
    } catch (err: any) {
      const errMsg = err?.message || 'Error updating score.';
      // Local fallback
      if (errMsg.includes('HTTP error') || errMsg.includes('Failed to fetch')) {
        const updated = scores.map((s) => {
          if (s.id === id) {
            return {
              ...s,
              score: score !== undefined ? score : s.score,
              date: date !== undefined ? date : s.date,
              courseName: courseName !== undefined ? courseName : s.courseName,
            };
          }
          return s;
        });
        const sorted = updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        persistScores(sorted);
        return { success: true };
      }
      return { success: false, error: errMsg };
    }
  };

  const deleteScore = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.scores.delete(id);
      if (res.success && res.scores) {
        setScores(res.scores);
        setTotalScoreCount(res.totalCount);
        localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(res.scores));
        return { success: true };
      }
      return { success: false, error: 'Failed to delete score.' };
    } catch (err: any) {
      const filtered = scores.filter((s) => s.id !== id);
      persistScores(filtered);
      setTotalScoreCount(filtered.length);
      return { success: true };
    }
  };

  // 5 Lucky Numbers: 1–99 (application product rule, completely separate from Stableford scores)
  const luckyNumbers: number[] =
    user?.luckyNumbers && user.luckyNumbers.length === 5
      ? user.luckyNumbers
      : [7, 28, 46, 71, 94];

  const updateCharity = async (
    charityId: string,
    pledgePercent: number
  ): Promise<{ success: boolean; error?: string }> => {
    setSelectedCharityId(charityId);
    setCharityPledgePercent(pledgePercent);
    localStorage.setItem(CHARITY_STORAGE_KEY, JSON.stringify({ charityId, pledgePercent }));

    if (user) {
      setUser({
        ...user,
        selectedCharityId: charityId,
        selectedCharity: charityId,
        charityPledgePercent: pledgePercent,
        charityContributionPercentage: pledgePercent,
      });

      try {
        const res = await api.membership.updateCharity(charityId, pledgePercent);
        if (res.success && res.user) {
          setUser({
            ...user,
            ...res.user,
            selectedCharityId: res.user.selectedCharity || charityId,
            charityPledgePercent: res.user.charityContributionPercentage || pledgePercent,
          });
        }
        return { success: true };
      } catch (err: any) {
        console.warn('⚠️ Could not sync charity selection to MongoDB Atlas:', err);
        return { success: false, error: err?.message || 'Failed to update charity on server' };
      }
    }

    return { success: true };
  };

  const membershipStatus: MembershipStatus = user?.membershipStatus || 'none';
  const membershipMode: MembershipMode = user?.membershipMode || 'none';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        membershipStatus,
        membershipMode,
        scores,
        totalScoreCount,
        selectedCharityId,
        charityPledgePercent,
        luckyNumbers,
        signup,
        login,
        logout,
        activateMembership,
        verifyPayment,
        cancelMembership,
        addScore,
        editScore,
        deleteScore,
        refreshScores,
        updateCharity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
