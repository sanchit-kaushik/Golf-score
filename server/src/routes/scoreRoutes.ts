import { Router } from 'express';
import {
  getMyScores,
  addScore,
  updateScore,
  deleteScore,
} from '../controllers/scoreController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const scoreRoutes = Router();

// All score operations require authentication
scoreRoutes.use(requireAuth);

scoreRoutes.get('/', getMyScores);
scoreRoutes.get('/my-scores', getMyScores);
scoreRoutes.post('/', addScore);
scoreRoutes.put('/:id', updateScore);
scoreRoutes.delete('/:id', deleteScore);
