import mongoose, { Document, Schema, Model } from 'mongoose';

export type DonationStatus = 'pending' | 'paid' | 'failed';

export interface IDonation extends Document {
  userId: mongoose.Types.ObjectId;
  charityId: string;
  charityName: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: DonationStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    charityId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    charityName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      enum: [250, 500, 1000, 2500], // Strictly enforced allowed donation tiers
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DonationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
