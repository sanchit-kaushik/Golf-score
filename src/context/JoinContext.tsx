import React, { createContext, useContext, useState, useEffect } from 'react';
import type { MembershipPlan, JoinAccountForm } from '../types';
import { MEMBERSHIP_PLANS } from '../data/plans';

interface JoinContextType {
  selectedPlanId: 'monthly' | 'yearly' | null;
  selectedPlan: MembershipPlan | null;
  account: JoinAccountForm;
  selectPlan: (planId: 'monthly' | 'yearly') => void;
  updateAccount: (data: Partial<JoinAccountForm>) => void;
  resetJoinFlow: () => void;
}

const STORAGE_KEY = 'dh_join_flow';

const defaultAccount: JoinAccountForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const JoinContext = createContext<JoinContextType | undefined>(undefined);

export const JoinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'yearly' | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedPlanId === 'monthly' || parsed.selectedPlanId === 'yearly') {
          return parsed.selectedPlanId;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [account, setAccount] = useState<JoinAccountForm>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.account) {
          return {
            fullName: parsed.account.fullName || '',
            email: parsed.account.email || '',
            password: '',
            confirmPassword: ''
          };
        }
      }
    } catch {
      // ignore
    }
    return defaultAccount;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedPlanId,
        account: {
          fullName: account.fullName,
          email: account.email
        }
      }));
    } catch {
      // ignore
    }
  }, [selectedPlanId, account.fullName, account.email]);

  const selectPlan = (planId: 'monthly' | 'yearly') => {
    setSelectedPlanId(planId);
  };

  const updateAccount = (data: Partial<JoinAccountForm>) => {
    setAccount((prev) => ({ ...prev, ...data }));
  };

  const resetJoinFlow = () => {
    setSelectedPlanId(null);
    setAccount(defaultAccount);
    localStorage.removeItem(STORAGE_KEY);
  };

  const selectedPlan = MEMBERSHIP_PLANS.find((p) => p.id === selectedPlanId) || null;

  return (
    <JoinContext.Provider
      value={{
        selectedPlanId,
        selectedPlan,
        account,
        selectPlan,
        updateAccount,
        resetJoinFlow
      }}
    >
      {children}
    </JoinContext.Provider>
  );
};

export const useJoin = () => {
  const context = useContext(JoinContext);
  if (!context) {
    throw new Error('useJoin must be used within a JoinProvider');
  }
  return context;
};
