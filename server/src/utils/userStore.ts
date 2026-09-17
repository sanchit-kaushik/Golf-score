import mongoose from 'mongoose';
import { User, IUser, MembershipStatus, MembershipMode, MembershipPlanType, PaymentStatus } from '../models/User.js';
import { isConnectedToMongoDB } from '../config/db.js';

// In-memory fallback repository when MongoDB connection is not active
const memoryUsers = new Map<string, any>();

export interface RealPaymentActivationDetails {
  planId: 'monthly' | 'yearly';
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  selectedCharity?: string;
  charityContributionPercentage?: number;
}

export const userStore = {
  async findByEmail(email: string): Promise<any | null> {
    const normalizedEmail = email.trim().toLowerCase();
    if (isConnectedToMongoDB) {
      return User.findOne({ email: normalizedEmail });
    }
    return memoryUsers.get(normalizedEmail) || null;
  },

  async findById(id: string): Promise<any | null> {
    if (!id) return null;

    if (isConnectedToMongoDB) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        try {
          const doc = await User.findById(id);
          if (doc) return doc;
        } catch (err) {
          console.warn('⚠️ [userStore.findById] Mongoose lookup error:', err);
        }
      }
    }

    for (const user of memoryUsers.values()) {
      if (user.id === id || user._id === id) {
        return user;
      }
    }
    return null;
  },

  async create(data: {
    fullName: string;
    email: string;
    passwordHash: string;
    role?: 'user' | 'admin';
    membershipPlan?: MembershipPlanType;
    selectedCharity?: string;
    charityContributionPercentage?: number;
  }): Promise<any> {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (isConnectedToMongoDB) {
      const newUser = new User({
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        role: data.role || 'user',
        membershipStatus: 'none',
        membershipMode: 'none',
        membershipPlan: data.membershipPlan || null,
        selectedCharity: data.selectedCharity || 'youth-golf',
        charityContributionPercentage: data.charityContributionPercentage || 10,
        paymentStatus: 'none',
      });
      return newUser.save();
    }

    // In-memory simulated document
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userDoc: any = {
      id,
      _id: id,
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
      membershipStatus: 'none' as MembershipStatus,
      membershipMode: 'none' as MembershipMode,
      membershipPlan: data.membershipPlan || null,
      selectedCharity: data.selectedCharity || 'youth-golf',
      charityContributionPercentage: data.charityContributionPercentage || 10,
      paymentStatus: 'none' as PaymentStatus,
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySubscriptionId: null,
      razorpaySignature: null,
      paymentAmount: null,
      paymentCurrency: null,
      membershipStartDate: null,
      membershipEndDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(candidatePassword: string) {
        const bcrypt = await import('bcryptjs');
        return bcrypt.default.compare(candidatePassword, this.passwordHash);
      },
      toJSON() {
        const copy = { ...this };
        delete copy.passwordHash;
        delete copy._id;
        return copy;
      },
    };

    memoryUsers.set(normalizedEmail, userDoc);
    return userDoc;
  },

  async updateMembership(
    userId: string,
    update: {
      status: MembershipStatus;
      mode: MembershipMode;
      plan: MembershipPlanType;
      selectedCharity?: string;
      charityContributionPercentage?: number;
    }
  ): Promise<any | null> {
    const now = new Date();
    const endDate = new Date();
    if (update.plan === 'yearly') {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    const fieldsToUpdate: Record<string, any> = {
      membershipStatus: update.status,
      membershipMode: update.mode,
      membershipPlan: update.plan,
      membershipStartDate: now,
      membershipEndDate: endDate,
    };

    if (update.selectedCharity) {
      fieldsToUpdate.selectedCharity = update.selectedCharity;
    }
    if (update.charityContributionPercentage) {
      fieldsToUpdate.charityContributionPercentage = update.charityContributionPercentage;
    }

    if (isConnectedToMongoDB && mongoose.Types.ObjectId.isValid(userId)) {
      return User.findByIdAndUpdate(userId, fieldsToUpdate, { new: true });
    }

    const user = await this.findById(userId);
    if (!user) return null;

    Object.assign(user, fieldsToUpdate);
    user.updatedAt = new Date();
    return user;
  },

  /**
   * Activates REAL Membership upon verified Razorpay payment.
   * Strictly records verified transaction IDs and sets membershipMode = 'real'.
   */
  async activateRealMembership(
    userId: string,
    details: RealPaymentActivationDetails
  ): Promise<any | null> {
    const now = new Date();
    const endDate = new Date();
    if (details.planId === 'yearly') {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    const fieldsToUpdate: Record<string, any> = {
      membershipStatus: 'active',
      membershipMode: 'real',
      membershipPlan: details.planId,
      membershipStartDate: now,
      membershipEndDate: endDate,
      paymentStatus: 'paid',
      razorpayOrderId: details.razorpayOrderId || null,
      razorpayPaymentId: details.razorpayPaymentId,
      razorpaySubscriptionId: details.razorpaySubscriptionId || null,
      razorpaySignature: details.razorpaySignature || null,
      paymentAmount: details.amount,
      paymentCurrency: details.currency,
    };

    if (details.selectedCharity) {
      fieldsToUpdate.selectedCharity = details.selectedCharity;
    }
    if (details.charityContributionPercentage) {
      fieldsToUpdate.charityContributionPercentage = details.charityContributionPercentage;
    }

    if (isConnectedToMongoDB && mongoose.Types.ObjectId.isValid(userId)) {
      return User.findByIdAndUpdate(userId, fieldsToUpdate, { new: true });
    }

    const user = await this.findById(userId);
    if (!user) return null;

    Object.assign(user, fieldsToUpdate);
    user.updatedAt = new Date();
    return user;
  },

  async updateCharity(
    userId: string,
    charityId: string,
    charityContributionPercentage: number
  ): Promise<any | null> {
    const fieldsToUpdate = {
      selectedCharity: charityId.trim(),
      charityContributionPercentage: Math.min(100, Math.max(10, charityContributionPercentage)),
    };

    if (isConnectedToMongoDB && mongoose.Types.ObjectId.isValid(userId)) {
      return User.findByIdAndUpdate(userId, fieldsToUpdate, { new: true });
    }

    const user = await this.findById(userId);
    if (!user) return null;

    Object.assign(user, fieldsToUpdate);
    user.updatedAt = new Date();
    return user;
  },
};
