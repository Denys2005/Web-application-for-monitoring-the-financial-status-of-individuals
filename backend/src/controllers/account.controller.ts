import { Request, Response } from 'express';
import { accountService } from '../services/account.service.js';

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const accounts = await accountService.getAccounts(userId);
    res.json({ accounts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, balance } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) return res.status(400).json({ message: 'Invalid balance' });

    const account = await accountService.createAccount(userId, name, parsedBalance);
    res.status(201).json({ account });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { name, balance } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) return res.status(400).json({ message: 'Invalid balance' });

    const account = await accountService.updateAccount(userId, id, name, parsedBalance);
    res.json({ account });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    await accountService.deleteAccount(userId, id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
