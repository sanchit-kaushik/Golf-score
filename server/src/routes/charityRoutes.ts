import { Router } from 'express';
import { getCharities, getCharityById } from '../controllers/charityController.js';

export const charityRoutes = Router();

charityRoutes.get('/', getCharities);
charityRoutes.get('/:id', getCharityById);
