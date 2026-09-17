import mongoose, { Document, Schema, Model } from 'mongoose';

export type PaymentRecordStatus = 'created' | 'verified' | 'failed' | 'refunded';
export type PaymentType = 'order' | 'subscription';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  planId: 'monthly' | 'yearly';
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySubscriptionId?: string;
  razorpaySignature?: string;
  errorReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    planId: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'subscription'],
      default: 'order',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'verified', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySubscriptionId: {
      type: String,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    errorReason: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
