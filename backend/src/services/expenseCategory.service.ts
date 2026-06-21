import prisma from '../config/database.config.js';

export async function getExpenseCategories(userId: number) {
  return await prisma.expenseCategory.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function createExpenseCategory(userId: number, name: string) {
  // Check if it already exists
  const existing = await prisma.expenseCategory.findFirst({
    where: { userId, name },
  });
  
  if (existing) {
    return existing;
  }

  return await prisma.expenseCategory.create({
    data: {
      userId,
      name,
    },
  });
}

export async function deleteExpenseCategory(userId: number, id: number) {
  // First verify ownership
  const category = await prisma.expenseCategory.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!category) {
    return null;
  }

  // Delete the category
  await prisma.expenseCategory.delete({
    where: { id },
  });

  return true;
}
