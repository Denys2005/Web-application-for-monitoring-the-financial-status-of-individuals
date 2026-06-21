import prisma from '../config/database.config.js';
import { logExpenseEvent } from './event.service.js';
import { ActionType } from '../types/event.types.js';

interface ExpenseData {
  name: string;
  amount: number;
  categoryId?: number | null;
  accountId?: number | null;
}

/**
 * Get all expenses for a user
 */
export async function getExpenses(userId: number) {
  // First ensure user has an income statement
  const incomeStatement = await prisma.incomeStatement.findFirst({
    where: { userId },
    include: {
      Expense: {
        include: { Category: true, Account: true }
      }
    }
  });

  if (!incomeStatement) {
    // Create income statement if it doesn't exist
    const newStatement = await prisma.incomeStatement.create({
      data: { userId },
      include: {
        Expense: {
          include: { Category: true, Account: true }
        }
      }
    });
    return newStatement.Expense;
  }

  return incomeStatement.Expense;
}

/**
 * Add a new expense for a user
 */
export async function addExpense(userId: number, data: ExpenseData) {
  // Get or create income statement
  let incomeStatement = await prisma.incomeStatement.findFirst({
    where: { userId }
  });

  if (!incomeStatement) {
    incomeStatement = await prisma.incomeStatement.create({
      data: { userId }
    });
  }

  try {
    const newExpense = await prisma.expense.create({
      data: {
        name: data.name,
        amount: parseFloat(data.amount.toString()), // Ensure amount is a float
        isId: incomeStatement.id, // Link to income statement
        ...(data.categoryId != null ? { categoryId: data.categoryId } : {}),
        ...(data.accountId != null ? { accountId: data.accountId } : {})
      },
      include: { Category: true, Account: true }
    });
    
    if (data.accountId) {
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: parseFloat(data.amount.toString()) } }
      });
    }

    // Log the CREATE event
    await logExpenseEvent(
      ActionType.CREATE,
      userId,
      newExpense.id,
      undefined,
      {
        name: newExpense.name,
        amount: newExpense.amount,
        category: newExpense.Category?.name,
        account: newExpense.Account?.name
      }
    );
    
    return newExpense;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

/**
 * Update an expense
 * Verifies ownership before update
 */
export async function updateExpense(userId: number, expenseId: number, data: ExpenseData) {
  // First verify ownership
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      IncomeStatement: {
        userId
      }
    },
    include: { Category: true, Account: true }
  });

  if (!expense) {
    return null;
  }

  // Capture before state
  const beforeValue = {
    name: expense.name,
    amount: expense.amount,
    category: expense.Category?.name,
    account: expense.Account?.name
  };

  const oldAmount = parseFloat(expense.amount.toString());
  const newAmount = parseFloat(data.amount.toString());
  const oldAccountId = expense.accountId;
  const newAccountId = data.accountId !== undefined ? data.accountId : expense.accountId;

  if (oldAccountId === newAccountId) {
    if (oldAccountId && oldAmount !== newAmount) {
      const diff = newAmount - oldAmount;
      await prisma.account.update({
        where: { id: oldAccountId },
        data: { balance: { decrement: diff } }
      });
    }
  } else {
    if (oldAccountId) {
      await prisma.account.update({
        where: { id: oldAccountId },
        data: { balance: { increment: oldAmount } }
      });
    }
    if (newAccountId) {
      await prisma.account.update({
        where: { id: newAccountId },
        data: { balance: { decrement: newAmount } }
      });
    }
  }

  // Update the expense
  const updatedExpense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      name: data.name,
      amount: data.amount,
      categoryId: data.categoryId !== undefined ? data.categoryId : expense.categoryId,
      accountId: data.accountId !== undefined ? data.accountId : expense.accountId
    },
    include: { Category: true, Account: true }
  });

  // Log the UPDATE event
  await logExpenseEvent(
    ActionType.UPDATE,
    userId,
    expenseId,
    beforeValue,
    {
      name: updatedExpense.name,
      amount: updatedExpense.amount,
      category: updatedExpense.Category?.name,
      account: updatedExpense.Account?.name
    }
  );

  return updatedExpense;
}

/**
 * Delete an expense
 * Verifies ownership before deletion
 */
export async function deleteExpense(userId: number, expenseId: number) {
  // First verify ownership
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      IncomeStatement: {
        userId
      }
    },
    include: { Category: true, Account: true }
  });

  if (!expense) {
    return null;
  }

  // Capture before state for event log
  const beforeValue = {
    name: expense.name,
    amount: expense.amount,
    category: expense.Category?.name,
    account: expense.Account?.name
  };

  if (expense.accountId) {
    await prisma.account.update({
      where: { id: expense.accountId },
      data: { balance: { increment: parseFloat(expense.amount.toString()) } }
    });
  }

  // Delete the expense
  await prisma.expense.delete({
    where: { id: expenseId }
  });

  // Log the DELETE event (entity is deleted but event remains)
  await logExpenseEvent(
    ActionType.DELETE,
    userId,
    expenseId,
    beforeValue,
    undefined
  );

  return true;
}