import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type MembershipStatus = 'none' | 'pending' | 'active' | 'cancelled' | 'expired';
export type MembershipMode = 'none' | 'real' | 'demo';
export type MembershipPlanType = 'monthly' | 'yearly' | null;
export type PaymentStatus = 'none' | 'pending' | 'paid' | 'failed' | 'refunded';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  membershipStatus: MembershipStatus;
  membershipMode: MembershipMode;
  membershipPlan: MembershipPlanType;
  membershipStartDate: Date | null;
  membershipEndDate: Date | null;
  selectedCharity: string;
  charityContributionPercentage: number;
  luckyNumbers: number[];
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySubscriptionId?: string | null;
  razorpaySignature?: string | null;
  paymentAmount?: number | null;
  paymentCurrency?: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    membershipStatus: {
      type: String,
      enum: ['none', 'pending', 'active', 'cancelled', 'expired'],
      default: 'none',
      index: true,
    },
    membershipMode: {
      type: String,
      enum: ['none', 'real', 'demo'],
      default: 'none',
    },
    membershipPlan: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null,
    },
    membershipStartDate: {
      type: Date,
      default: null,
    },
    membershipEndDate: {
      type: Date,
      default: null,
    },
    selectedCharity: {
      type: String,
      default: 'youth-golf',
      trim: true,
    },
    charityContributionPercentage: {
      type: Number,
      default: 10,
      min: [10, 'Minimum charity contribution is 10%'],
      max: [100, 'Maximum charity contribution is 100%'],
    },
    luckyNumbers: {
      type: [Number],
      default: [7, 28, 46, 71, 94],
    },
    paymentStatus: {
      type: String,
      enum: ['none', 'pending', 'paid', 'failed', 'refunded'],
      default: 'none',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySubscriptionId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paymentAmount: {
      type: Number,
      default: null,
    },
    paymentCurrency: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // NEVER return passwordHash to client
        return ret;
      },
    },
  }
);

// Method to verify candidate password against bcrypt hash
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
