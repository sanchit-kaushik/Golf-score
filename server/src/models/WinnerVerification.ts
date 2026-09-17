import mongoose, { Document, Schema, Model } from 'mongoose';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IWinnerVerification extends Document {
  userId: mongoose.Types.ObjectId;
  drawId: mongoose.Types.ObjectId;
  drawResultId: mongoose.Types.ObjectId;
  proofUrl: string;
  status: VerificationStatus;
  adminNote?: string;
  submittedAt: Date;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const WinnerVerificationSchema = new Schema<IWinnerVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    drawId: {
      type: Schema.Types.ObjectId,
      ref: 'DrawCycle',
      required: true,
      index: true,
    },
    drawResultId: {
      type: Schema.Types.ObjectId,
      ref: 'DrawResult',
      required: true,
      index: true,
    },
    proofUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

WinnerVerificationSchema.index({ userId: 1, drawId: 1 });

export const WinnerVerification: Model<IWinnerVerification> =
  mongoose.models.WinnerVerification ||
  mongoose.model<IWinnerVerification>('WinnerVerification', WinnerVerificationSchema);
