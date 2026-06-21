import prisma from '../config/database.config.js';
import { logIncomeEvent } from './event.service.js';
import { ActionType } from '../types/event.types.js';
import { determineIncomeQuadrant, IncomeQuadrant } from '../utils/incomeQuadrant.utils.js';

interface IncomeLineData {
  name: string;
  amount: number;
  type: string;
  quadrant?: IncomeQuadrant | string | null;
  accountId?: number | null;
}

/**
 * Get all income lines for a user
 */
export async function getIncomeLines(userId: number) {
  // First ensure user has an income statement
  const incomeStatement = await prisma.incomeStatement.findFirst({
    where: { userId },
    include: {
      IncomeLine: {
        include: { Account: true }
      }
    }
  });

  if (!incomeStatement) {
    // Create income statement if it doesn't exist
    const newStatement = await prisma.incomeStatement.create({
      data: {
        userId,
        IncomeLine: {
          create: [] // Start with empty income lines
        }
      },
      include: {
        IncomeLine: {
          include: { Account: true }
        }
      }
    });
    return newStatement.IncomeLine;
  }

  return incomeStatement.IncomeLine;
}

/**
 * Add a new income line for a user
 */
export async function addIncomeLine(userId: number, data: IncomeLineData) {
  // Get or create income statement
  let incomeStatement = await prisma.incomeStatement.findFirst({
    where: { userId }
  });

  if (!incomeStatement) {
    incomeStatement = await prisma.incomeStatement.create({
      data: { userId }
    });
  }

  // Create income line
  const resolvedQuadrant = determineIncomeQuadrant(data.type, data.quadrant as string | undefined);

  const newIncomeLine = await prisma.incomeLine.create({
    data: {
      name: data.name,
      amount: data.amount,
      type: data.type,
      quadrant: resolvedQuadrant,
      isId: incomeStatement.id, // Link to income statement
      ...(data.accountId != null ? { accountId: data.accountId } : {})
    },
    include: { Account: true }
  });

  if (data.accountId) {
    await prisma.account.update({
      where: { id: data.accountId },
      data: { balance: { increment: parseFloat(data.amount.toString()) } }
    });
  }

  // Log the CREATE event
  await logIncomeEvent(
    ActionType.CREATE,
    userId,
    newIncomeLine.id,
    undefined,
    {
      name: newIncomeLine.name,
      amount: newIncomeLine.amount,
      type: newIncomeLine.type,
      quadrant: newIncomeLine.quadrant,
      account: newIncomeLine.Account?.name
    }
  );

  return newIncomeLine;
}

/**
 * Update an income line
 * Verifies ownership before update
 */
export async function updateIncomeLine(userId: number, incomeLineId: number, data: IncomeLineData) {
  // First verify ownership
  const incomeLine = await prisma.incomeLine.findFirst({
    where: {
      id: incomeLineId,
      IncomeStatement: {
        userId
      }
    },
    include: { Account: true }
  });

  if (!incomeLine) {
    return null;
  }

  // Capture before state
  const beforeValue = {
    name: incomeLine.name,
    amount: incomeLine.amount,
    type: incomeLine.type,
    quadrant: incomeLine.quadrant,
    account: incomeLine.Account?.name
  };

  const oldAmount = parseFloat(incomeLine.amount.toString());
  const newAmount = parseFloat(data.amount.toString());
  const oldAccountId = incomeLine.accountId;
  const newAccountId = data.accountId !== undefined ? data.accountId : incomeLine.accountId;

  if (oldAccountId === newAccountId) {
    if (oldAccountId && oldAmount !== newAmount) {
      const diff = newAmount - oldAmount;
      await prisma.account.update({
        where: { id: oldAccountId },
        data: { balance: { increment: diff } }
      });
    }
  } else {
    if (oldAccountId) {
      await prisma.account.update({
        where: { id: oldAccountId },
        data: { balance: { decrement: oldAmount } }
      });
    }
    if (newAccountId) {
      await prisma.account.update({
        where: { id: newAccountId },
        data: { balance: { increment: newAmount } }
      });
    }
  }

  // Update the income line
  const resolvedQuadrant = determineIncomeQuadrant(data.type, data.quadrant as string | undefined);

  const updatedIncomeLine = await prisma.incomeLine.update({
    where: { id: incomeLineId },
    data: {
      name: data.name,
      amount: data.amount,
      type: data.type,
      quadrant: resolvedQuadrant,
      accountId: data.accountId !== undefined ? data.accountId : incomeLine.accountId
    },
    include: { Account: true }
  });

  // Log the UPDATE event
  await logIncomeEvent(
    ActionType.UPDATE,
    userId,
    incomeLineId,
    beforeValue,
    {
      name: updatedIncomeLine.name,
      amount: updatedIncomeLine.amount,
      type: updatedIncomeLine.type,
      quadrant: updatedIncomeLine.quadrant,
      account: updatedIncomeLine.Account?.name
    }
  );

  return updatedIncomeLine;
}

/**
 * Delete an income line
 * Verifies ownership before deletion
 */
export async function deleteIncomeLine(userId: number, incomeLineId: number) {
  // First verify ownership
  const incomeLine = await prisma.incomeLine.findFirst({
    where: {
      id: incomeLineId,
      IncomeStatement: {
        userId
      }
    },
    include: { Account: true }
  });

  if (!incomeLine) {
    return null;
  }

  // Capture before state for event log
  const beforeValue = {
    name: incomeLine.name,
    amount: incomeLine.amount,
    type: incomeLine.type,
    quadrant: incomeLine.quadrant,
    account: incomeLine.Account?.name
  };

  if (incomeLine.accountId) {
    await prisma.account.update({
      where: { id: incomeLine.accountId },
      data: { balance: { decrement: parseFloat(incomeLine.amount.toString()) } }
    });
  }

  // Delete the income line
  await prisma.incomeLine.delete({
    where: { id: incomeLineId }
  });

  // Log the DELETE event (entity is deleted but event remains)
  await logIncomeEvent(
    ActionType.DELETE,
    userId,
    incomeLineId,
    beforeValue,
    undefined
  );

  return true;
}