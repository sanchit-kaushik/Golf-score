import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILuckyNumberEntry extends Document {
  userId: mongoose.Types.ObjectId;
  drawCycleId: mongoose.Types.ObjectId;
  numbers: number[];
  locked: boolean;
  selectedAt: Date;
  lockedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LuckyNumberEntrySchema = new Schema<ILuckyNumberEntry>(
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
    numbers: {
      type: [Number],
      required: true,
      validate: {
        validator: function (val: number[]) {
          if (!Array.isArray(val) || val.length !== 5) return false;
          const unique = new Set(val);
          return unique.size === 5 && val.every((n) => Number.isInteger(n) && n >= 1 && n <= 99);
        },
        message: 'Must provide exactly 5 unique integers between 1 and 99',
      },
    },
    locked: {
      type: Boolean,
      default: false,
      index: true,
    },
    selectedAt: {
      type: Date,
      default: Date.now,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: exactly one lucky number entry per user per monthly draw cycle
LuckyNumberEntrySchema.index({ userId: 1, drawCycleId: 1 }, { unique: true });

export const LuckyNumberEntry: Model<ILuckyNumberEntry> =
  mongoose.models.LuckyNumberEntry ||
  mongoose.model<ILuckyNumberEntry>('LuckyNumberEntry', LuckyNumberEntrySchema);
