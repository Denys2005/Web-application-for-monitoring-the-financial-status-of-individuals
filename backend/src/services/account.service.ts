import prisma from '../config/database.config.js';

export const accountService = {
  getAccounts: async (userId: number) => {
    return prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  },

  createAccount: async (userId: number, name: string, balance: number) => {
    const existing = await prisma.account.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) {
      throw new Error('Account with this name already exists');
    }

    return prisma.account.create({
      data: {
        userId,
        name,
        balance,
      },
    });
  },

  updateAccount: async (userId: number, id: number, name: string, balance: number) => {
    const account = await prisma.account.findUnique({ where: { id } });
    if (!account || account.userId !== userId) {
      throw new Error('Account not found');
    }

    const existing = await prisma.account.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing && existing.id !== id) {
      throw new Error('Account with this name already exists');
    }

    return prisma.account.update({
      where: { id },
      data: { name, balance },
    });
  },

  deleteAccount: async (userId: number, id: number) => {
    const account = await prisma.account.findUnique({ where: { id } });
    if (!account || account.userId !== userId) {
      throw new Error('Account not found');
    }

    return prisma.account.delete({
      where: { id },
    });
  },
};
