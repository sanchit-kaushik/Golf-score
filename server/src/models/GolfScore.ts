import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IGolfScore extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  date: string; // YYYY-MM-DD normalized
  courseName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GolfScoreSchema = new Schema<IGolfScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'Stableford score is required'],
      min: [1, 'Stableford score must be at least 1 point'],
      max: [45, 'Stableford score cannot exceed 45 points'],
      validate: {
        validator: Number.isInteger,
        message: 'Stableford score must be a whole integer',
      },
    },
    date: {
      type: String,
      required: [true, 'Score date is required'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    courseName: {
      type: String,
      trim: true,
      default: 'Verified Course Round',
      maxlength: [120, 'Course name cannot exceed 120 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Enforce at most ONE score per user per date
GolfScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

// Index for fast chronological sorting (newest first)
GolfScoreSchema.index({ userId: 1, date: -1 });

export const GolfScore: Model<IGolfScore> =
  mongoose.models.GolfScore || mongoose.model<IGolfScore>('GolfScore', GolfScoreSchema);
