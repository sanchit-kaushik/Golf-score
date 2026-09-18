import mongoose, { Document, Schema, Model } from 'mongoose';

export type DrawCycleStatus = 'upcoming' | 'open' | 'locked' | 'published' | 'completed';
export type DrawMethod = 'random' | 'algorithmic';

export interface IDrawCycle extends Document {
  name: string;
  month: string;
  year: number;
  status: DrawCycleStatus;
  drawMethod: DrawMethod;
  winningNumbers: number[];
  prizePool: number;
  jackpotRollover: boolean;
  jackpotAmount: number;
  simulatedNumbers?: number[];
  isDemo?: boolean;
  demoRunCount?: number;
  lockDate: Date;
  drawnAt?: Date | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const DrawCycleSchema = new Schema<IDrawCycle>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'locked', 'published', 'completed'],
      default: 'open',
      index: true,
    },
    drawMethod: {
      type: String,
      enum: ['random', 'algorithmic'],
      default: 'random',
    },
    winningNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator: function (val: number[]) {
          if (val.length === 0) return true;
          if (val.length !== 5) return false;
          // All numbers 1-99 and unique
          const unique = new Set(val);
          return unique.size === 5 && val.every((n) => n >= 1 && n <= 99);
        },
        message: 'Winning numbers must be exactly 5 unique integers between 1 and 99',
      },
    },
    prizePool: {
      type: Number,
      default: 100000, // ₹100,000 standard prize pool
      min: 0,
    },
    jackpotRollover: {
      type: Boolean,
      default: true,
    },
    jackpotAmount: {
      type: Number,
      default: 40000, // 40% of pool for 5-match tier
      min: 0,
    },
    simulatedNumbers: {
      type: [Number],
      default: [],
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
    demoRunCount: {
      type: Number,
      default: 0,
    },
    lockDate: {
      type: Date,
      required: true,
    },
    drawnAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to ensure one cycle per month/year
DrawCycleSchema.index({ month: 1, year: 1 }, { unique: true });

export const DrawCycle: Model<IDrawCycle> =
  mongoose.models.DrawCycle || mongoose.model<IDrawCycle>('DrawCycle', DrawCycleSchema);
