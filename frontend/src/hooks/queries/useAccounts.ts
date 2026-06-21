import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsAPI } from '../../utils/api';

export interface Account {
  id: number;
  name: string;
  balance: number;
  userId: number;
}

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await accountsAPI.getAccounts();
      return response.accounts as Account[];
    },
  });
};

export const useAddAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; balance: number }) => accountsAPI.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; name: string; balance: number }) =>
      accountsAPI.updateAccount(data.id, { name: data.name, balance: data.balance }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      // If accounts balances are updated, it affects expenses and incomes, and balance sheet and cash savings if linked... 
      // Actually, updating an account balance manually is just adjusting it.
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => accountsAPI.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
