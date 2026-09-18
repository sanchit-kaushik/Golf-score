const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const isLocalHostDomain =
    isBrowser &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1');

  // If running in browser on remote domain (Vercel, custom domain), strictly use Render backend
  if (isBrowser && !isLocalHostDomain) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return 'https://golf-score-1-pn0b.onrender.com';
  }

  // Local development
  if (envUrl) return envUrl;
  return import.meta.env.PROD
    ? 'https://golf-score-1-pn0b.onrender.com'
    : 'http://localhost:5001';
};

const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = 'dh_auth_jwt_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Sends & receives HTTP-only cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    register: async (fullName: string, email: string, password: string, membershipPlan?: string | null) => {
      const res = await request<{ success: boolean; token: string; user: any; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, membershipPlan }),
      });
      if (res.token) {
        setToken(res.token);
      }
      return res;
    },

    login: async (email: string, password: string) => {
      const res = await request<{ success: boolean; token: string; user: any; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) {
        setToken(res.token);
      }
      return res;
    },

    getMe: async () => {
      return request<{ success: boolean; user: any }>('/api/auth/me', {
        method: 'GET',
      });
    },

    logout: async () => {
      try {
        await request<{ success: boolean; message: string }>('/api/auth/logout', {
          method: 'POST',
        });
      } finally {
        setToken(null);
      }
    },
  },

  membership: {
    activateDemo: async (plan: 'monthly' | 'yearly') => {
      return request<{ success: boolean; user: any; message: string }>('/api/membership/demo', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });
    },

    getStatus: async () => {
      return request<{
        success: boolean;
        membershipStatus: string;
        membershipMode: string;
        membershipPlan: string | null;
        membershipStartDate: string | null;
        membershipEndDate: string | null;
      }>('/api/membership/status', {
        method: 'GET',
      });
    },

    updateCharity: async (charityId: string, charityContributionPercentage: number) => {
      return request<{
        success: boolean;
        message: string;
        user: any;
      }>('/api/membership/charity', {
        method: 'POST',
        body: JSON.stringify({ charityId, charityContributionPercentage }),
      });
    },
  },

  payments: {
    getConfig: async () => {
      return request<{
        isConfigured: boolean;
        keyId: string | null;
        currency: string;
        hasMonthlySubscriptionPlan: boolean;
        hasYearlySubscriptionPlan: boolean;
      }>('/api/payments/config', {
        method: 'GET',
      });
    },

    createOrder: async (planId: 'monthly' | 'yearly', charityId?: string, charityPledgePercent?: number) => {
      return request<{
        success: boolean;
        paymentType: 'order' | 'subscription';
        orderId?: string;
        subscriptionId?: string;
        amount: number;
        currency: string;
        keyId: string;
        plan: {
          id: string;
          name: string;
          displayPrice: number;
          currency: string;
          billingPeriod: string;
        };
      }>('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId, charityId, charityPledgePercent }),
      });
    },

    verify: async (data: {
      planId: 'monthly' | 'yearly';
      razorpay_order_id?: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      razorpay_subscription_id?: string;
      charityId?: string;
      charityPledgePercent?: number;
    }) => {
      return request<{
        success: boolean;
        message: string;
        user: any;
      }>('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  draw: {
    getCurrent: async () => {
      return request<{
        success: boolean;
        cycle: {
          id: string;
          name: string;
          month: string;
          year: number;
          status: 'upcoming' | 'open' | 'locked' | 'completed';
          isLocked: boolean;
          drawMethod: string;
          winningNumbers: number[];
          prizePool: number;
          jackpotRollover: boolean;
          jackpotAmount: number;
          lockDate: string;
          drawnAt?: string | null;
        };
        totalParticipants?: number;
        matchingParticipants?: Array<{
          userId: string;
          userName: string;
          userEmail: string;
          luckyNumbers: number[];
          matchedNumbers: number[];
          matchCount: number;
          tier: string;
          prizeAmount: number;
          paymentStatus?: string;
          verificationStatus?: string;
        }>;
        tierAllocations?: {
          '5-match': {
            name: string;
            percentage: string;
            pool: number;
            winners: number;
            perWinner: number;
            rollover: boolean;
          };
          '4-match': {
            name: string;
            percentage: string;
            pool: number;
            winners: number;
            perWinner: number;
            rollover: boolean;
          };
          '3-match': {
            name: string;
            percentage: string;
            pool: number;
            winners: number;
            perWinner: number;
            rollover: boolean;
          };
        };
        isDemo?: boolean;
        demoRunNumber?: number;
        label?: string;
        userEntry: {
          id: string;
          numbers: number[];
          locked: boolean;
          selectedAt: string;
        } | null;
        userResult: {
          id?: string;
          matchCount: number;
          matchedNumbers: number[];
          prizeTier: string;
          prizeAmount: number;
          paymentStatus?: string;
          verificationStatus?: string;
          proofUrl?: string;
          adminNote?: string;
          status: string;
        } | null;
      }>('/api/draw/current', {
        method: 'GET',
      });
    },

    saveMyEntry: async (numbers: number[]) => {
      return request<{
        success: boolean;
        message: string;
        entry: {
          id: string;
          numbers: number[];
          locked: boolean;
          selectedAt: string;
        };
      }>('/api/draw/my-entry', {
        method: 'POST',
        body: JSON.stringify({ numbers }),
      });
    },

    lockMyEntry: async () => {
      return request<{
        success: boolean;
        message: string;
        entry: {
          id: string;
          numbers: number[];
          locked: boolean;
          lockedAt: string;
        };
      }>('/api/draw/lock-my-entry', {
        method: 'POST',
      });
    },

    executeDraw: async (winningNumbers?: number[]) => {
      return request<{
        success: boolean;
        message: string;
        drawCycle: any;
      }>('/api/draw/execute-draw', {
        method: 'POST',
        body: JSON.stringify({ winningNumbers }),
      });
    },

    executeSimulation: async (winningNumbers?: number[]) => {
      return request<{
        success: boolean;
        message: string;
        drawCycle: any;
      }>('/api/draw/execute-draw', {
        method: 'POST',
        body: JSON.stringify({ winningNumbers }),
      });
    },

    submitProof: async (proofUrl: string, drawId?: string) => {
      return request<{
        success: boolean;
        message: string;
        verification: {
          id: string;
          status: string;
          proofUrl: string;
          submittedAt: string;
        };
      }>('/api/draw/verify-winner', {
        method: 'POST',
        body: JSON.stringify({ proofUrl, drawId }),
      });
    },

    getMyWinnings: async () => {
      return request<{
        success: boolean;
        winnings: Array<{
          id: string;
          drawId: string;
          drawName: string;
          month: string;
          year: number;
          luckyNumbers: number[];
          winningNumbers: number[];
          matchCount: number;
          matchedNumbers: number[];
          prizeTier: string;
          prizeAmount: number;
          paymentStatus: string;
          verificationStatus: string;
          proofUrl?: string;
          adminNote?: string;
          createdAt: string;
        }>;
        totalWon: number;
      }>('/api/draw/my-winnings', {
        method: 'GET',
      });
    },
  },

  charities: {
    getAll: async () => {
      return request<{
        success: boolean;
        charities: Array<{
          charityId: string;
          name: string;
          category: string;
          summary: string;
          description: string;
          imageUrl: string;
          website?: string;
          featured: boolean;
        }>;
      }>('/api/charities', {
        method: 'GET',
      });
    },
  },

  scores: {
    getAll: async () => {
      return request<{
        success: boolean;
        scores: Array<{
          id: string;
          score: number;
          date: string;
          courseName?: string;
          createdAt?: string;
        }>;
        totalCount: number;
      }>('/api/scores', {
        method: 'GET',
      });
    },

    create: async (score: number, date: string, courseName?: string) => {
      return request<{
        success: boolean;
        message: string;
        createdScore: {
          id: string;
          score: number;
          date: string;
          courseName?: string;
        };
        scores: Array<{
          id: string;
          score: number;
          date: string;
          courseName?: string;
          createdAt?: string;
        }>;
        totalCount: number;
      }>('/api/scores', {
        method: 'POST',
        body: JSON.stringify({ score, date, courseName }),
      });
    },

    update: async (id: string, score?: number, date?: string, courseName?: string) => {
      return request<{
        success: boolean;
        message: string;
        score: {
          id: string;
          score: number;
          date: string;
          courseName?: string;
        };
        scores: Array<{
          id: string;
          score: number;
          date: string;
          courseName?: string;
          createdAt?: string;
        }>;
        totalCount: number;
      }>((`/api/scores/${id}`), {
        method: 'PUT',
        body: JSON.stringify({ score, date, courseName }),
      });
    },

    delete: async (id: string) => {
      return request<{
        success: boolean;
        message: string;
        scores: Array<{
          id: string;
          score: number;
          date: string;
          courseName?: string;
          createdAt?: string;
        }>;
        totalCount: number;
      }>((`/api/scores/${id}`), {
        method: 'DELETE',
      });
    },
  },

  donations: {
    createOrder: async (charityId: string, amount: number) => {
      return request<{
        success: boolean;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        charity?: {
          id: string;
          name: string;
        };
        donationAmount?: number;
        donationId?: string;
        error?: string;
      }>('/api/donations/create-order', {
        method: 'POST',
        body: JSON.stringify({ charityId, amount }),
      });
    },

    verify: async (payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      return request<{
        success: boolean;
        message?: string;
        error?: string;
        donation?: {
          id: string;
          charityId: string;
          charityName: string;
          amount: number;
          currency: string;
          status: string;
          paidAt: string;
          razorpayPaymentId?: string;
        };
      }>('/api/donations/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    getMyDonations: async () => {
      return request<{
        success: boolean;
        donations: Array<{
          id: string;
          charityId: string;
          charityName: string;
          amount: number;
          currency: string;
          status: string;
          paidAt?: string;
          createdAt: string;
          razorpayPaymentId?: string;
        }>;
        totalDonated: number;
      }>('/api/donations/my-donations', {
        method: 'GET',
      });
    },
  },

  admin: {
    getOverview: async () => {
      return request<{
        success: boolean;
        stats: {
          totalUsers: number;
          activeMembers: number;
          currentPrizePool: number;
          totalCharityAllocations: number;
          membershipCharityAllocations: number;
          totalDonations: number;
          totalWinners: number;
        };
      }>('/api/admin/overview', { method: 'GET' });
    },

    getUsers: async () => {
      return request<{
        success: boolean;
        users: any[];
        count: number;
      }>('/api/admin/users', { method: 'GET' });
    },

    updateUserRole: async (id: string, role: 'user' | 'admin') => {
      return request<{
        success: boolean;
        user: any;
      }>(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },

    getCharities: async () => {
      return request<{
        success: boolean;
        charities: any[];
      }>('/api/admin/charities', { method: 'GET' });
    },

    createCharity: async (data: any) => {
      return request<{
        success: boolean;
        charity: any;
      }>('/api/admin/charities', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateCharity: async (id: string, data: any) => {
      return request<{
        success: boolean;
        charity: any;
      }>(`/api/admin/charities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    getDonations: async () => {
      return request<{
        success: boolean;
        donations: any[];
        totalAmount: number;
        count: number;
      }>('/api/admin/donations', { method: 'GET' });
    },

    getWinners: async () => {
      return request<{
        success: boolean;
        winners: any[];
        count: number;
      }>('/api/admin/winners', { method: 'GET' });
    },

    updateWinnerVerification: async (id: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) => {
      return request<{
        success: boolean;
        drawResult: any;
      }>(`/api/admin/winners/${id}/verification`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNote }),
      });
    },

    markWinnerPayout: async (id: string) => {
      return request<{
        success: boolean;
        drawResult: any;
      }>(`/api/admin/winners/${id}/payout`, {
        method: 'PUT',
      });
    },

    simulateDraw: async () => {
      return request<{
        success: boolean;
        simulatedNumbers: number[];
        previewStats: {
          match5: number;
          match4: number;
          match3: number;
          entriesCount: number;
        };
        message: string;
      }>('/api/admin/draws/simulate', { method: 'POST' });
    },

    runDemoDraw: async () => {
      return request<{
        success: boolean;
        isDemo: boolean;
        demoRunNumber: number;
        executedAt: string;
        label: string;
        winningNumbers: number[];
        prizePool: number;
        evaluatedEntriesCount: number;
        tiers: {
          tier5: {
            name: string;
            percentage: string;
            poolAmount: number;
            winnerCount: number;
            prizePerWinner: number;
            rollover: boolean;
          };
          tier4: {
            name: string;
            percentage: string;
            poolAmount: number;
            winnerCount: number;
            prizePerWinner: number;
            rollover: boolean;
          };
          tier3: {
            name: string;
            percentage: string;
            poolAmount: number;
            winnerCount: number;
            prizePerWinner: number;
            rollover: boolean;
          };
        };
        winners: Array<{
          userId: string;
          userName: string;
          userEmail: string;
          luckyNumbers: number[];
          matchedNumbers: number[];
          matchCount: number;
          tier: string;
          prizeAmount: number;
        }>;
        notice: string;
      }>('/api/admin/draws/demo-draw', { method: 'POST' });
    },

    generateWinningNumbers: async () => {
      return request<{
        success: boolean;
        winningNumbers: number[];
        cycle: any;
        drawCycle?: any;
        matchingParticipants?: any[];
        tierAllocations?: any;
        totalParticipants?: number;
      }>('/api/admin/draws/generate-numbers', { method: 'POST' });
    },

    lockDraw: async () => {
      return request<{
        success: boolean;
        cycle: any;
        drawCycle?: any;
      }>('/api/admin/draws/lock', { method: 'POST' });
    },

    openDraw: async () => {
      return request<{
        success: boolean;
        cycle: any;
        drawCycle?: any;
      }>('/api/admin/draws/open', { method: 'POST' });
    },

    executeDraw: async (winningNumbers?: number[]) => {
      return request<{
        success: boolean;
        isDemo: boolean;
        demoRunNumber: number;
        label: string;
        message?: string;
        executedAt: string;
        winningNumbers: number[];
        cycle?: any;
        drawCycle: any;
        tierAllocations: {
          '5-match': {
            name: string;
            percentage: string;
            pool: number;
            winners: number;
            perWinner: number;
            rollover: boolean;
          };
          '4-match': {
            name: string;
            percentage: string;
            pool: number;
            winners: number;
            perWinner: number;
            rollover: boolean;
          };
          '3-match': {
            name: string;
            percentage: string;
            pool: number;
            winners: number;
            perWinner: number;
            rollover: boolean;
          };
        };
        matchingParticipants: Array<{
          userId: string;
          userName: string;
          userEmail: string;
          luckyNumbers: number[];
          matchedNumbers: number[];
          matchCount: number;
          tier: string;
          prizeAmount: number;
          paymentStatus?: string;
        }>;
        totalParticipants: number;
        notice?: string;
      }>('/api/admin/draws/execute', {
        method: 'POST',
        body: JSON.stringify({ winningNumbers }),
      });
    },

    publishDraw: async (winningNumbers?: number[]) => {
      return request<{
        success: boolean;
        cycle?: any;
        drawCycle?: any;
        winningNumbers?: number[];
        matchingParticipants?: any[];
        tierAllocations?: any;
        totalParticipants?: number;
        summary?: any;
      }>('/api/admin/draws/execute', {
        method: 'POST',
        body: JSON.stringify({ winningNumbers }),
      });
    },

    getReports: async () => {
      return request<{
        success: boolean;
        report: {
          totalUsers: number;
          activeMembers: number;
          totalPrizePool: number;
          totalCharityAllocation: number;
          totalMembershipAllocation: number;
          totalIndependentDonations: number;
          totalWinners: number;
          totalPaidWinnings: number;
          charityImpact: Array<{
            charityId: string;
            charityName: string;
            category: string;
            membershipAllocation: number;
            independentDonations: number;
            totalTracked: number;
          }>;
          monthlyTrends: Array<{
            month: string;
            members: number;
            prizePool: number;
            charity: number;
          }>;
        };
      }>('/api/admin/reports', { method: 'GET' });
    },
  },
};

