import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICharity extends Document {
  charityId: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  imageUrl: string;
  website?: string;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CharitySchema = new Schema<ICharity>(
  {
    charityId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Charity: Model<ICharity> =
  mongoose.models.Charity || mongoose.model<ICharity>('Charity', CharitySchema);
