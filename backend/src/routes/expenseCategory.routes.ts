import { Router } from 'express';
import {
  getExpenseCategoriesHandler,
  addExpenseCategoryHandler,
  deleteExpenseCategoryHandler,
} from '../controllers/expenseCategory.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All expense category routes require authentication
router.use(authenticateToken);

// GET /api/expense-categories - Get all categories
router.get('/', getExpenseCategoriesHandler);

// POST /api/expense-categories - Add new category
router.post('/', addExpenseCategoryHandler);

// DELETE /api/expense-categories/:id - Delete category
router.delete('/:id', deleteExpenseCategoryHandler);

export default router;
