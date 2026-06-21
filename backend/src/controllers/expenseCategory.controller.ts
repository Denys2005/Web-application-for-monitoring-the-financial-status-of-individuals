import { Request, Response, NextFunction } from 'express';
import {
  getExpenseCategories,
  createExpenseCategory,
  deleteExpenseCategory,
} from '../services/expenseCategory.service.js';

/**
 * Get all expense categories for the authenticated user
 * @route GET /api/expense-categories
 */
export async function getExpenseCategoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const categories = await getExpenseCategories(userId);
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get expense categories error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Add a new expense category
 * @route POST /api/expense-categories
 */
export async function addExpenseCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate input
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Name is required.',
      });
    }

    const category = await createExpenseCategory(userId, name.trim());

    return res.status(201).json({
      message: 'Expense category added successfully',
      category,
    });
  } catch (error) {
    console.error('Add expense category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete an expense category
 * @route DELETE /api/expense-categories/:id
 */
export async function deleteExpenseCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const categoryId = parseInt(String(req.params.id), 10);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const deleted = await deleteExpenseCategory(userId, categoryId);

    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
