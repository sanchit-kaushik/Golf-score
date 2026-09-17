import { Request, Response } from 'express';
import { Charity } from '../models/Charity.js';

// GET /api/charities
export const getCharities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const charities = await Charity.find({ active: true }).sort({ featured: -1, createdAt: 1 });
    res.status(200).json({
      success: true,
      charities,
    });
  } catch (error: any) {
    console.error('Error fetching charities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve partner charities.',
    });
  }
};

// GET /api/charities/:id
export const getCharityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const charity = await Charity.findOne({ charityId: id, active: true });

    if (!charity) {
      res.status(404).json({
        success: false,
        error: 'Charity not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      charity,
    });
  } catch (error: any) {
    console.error('Error fetching charity by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve charity details.',
    });
  }
};
