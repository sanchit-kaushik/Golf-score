import mongoose, { Document, Schema, Model } from 'mongoose';

export type PrizeTierType = '5-match' | '4-match' | '3-match' | 'none';
export type PaymentStatusType = 'NOT_WINNER' | 'PENDING' | 'PAID';
export type WinnerVerificationStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IDrawResult extends Document {
  userId: mongoose.Types.ObjectId;
  drawCycleId: mongoose.Types.ObjectId;
  luckyNumbers: number[];
  winningNumbers: number[];
  matchCount: number;
  matchedNumbers: number[];
  prizeTier: PrizeTierType;
  prizeAmount: number;
  totalWinnersInTier: number;
  paymentStatus: PaymentStatusType;
  verificationStatus: WinnerVerificationStatus;
  proofUrl?: string;
  adminNote?: string;
  reviewedAt?: Date | null;
  paidAt?: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const DrawResultSchema = new Schema<IDrawResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    drawCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'DrawCycle',
      required: true,
      index: true,
    },
    luckyNumbers: {
      type: [Number],
      required: true,
    },
    winningNumbers: {
      type: [Number],
      required: true,
    },
    matchCount: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    matchedNumbers: {
      type: [Number],
      default: [],
    },
    prizeTier: {
      type: String,
      enum: ['5-match', '4-match', '3-match', 'none'],
      required: true,
      index: true,
    },
    prizeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWinnersInTier: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['NOT_WINNER', 'PENDING', 'PAID'],
      default: 'NOT_WINNER',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NONE',
      index: true,
    },
    proofUrl: {
      type: String,
      default: '',
      trim: true,
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: 'awarded',
    },
  },
  {
    timestamps: true,
  }
);

DrawResultSchema.index({ userId: 1, drawCycleId: 1 }, { unique: true });

export const DrawResult: Model<IDrawResult> =
  mongoose.models.DrawResult || mongoose.model<IDrawResult>('DrawResult', DrawResultSchema);
