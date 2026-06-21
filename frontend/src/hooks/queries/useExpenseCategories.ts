import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseCategoriesAPI } from '../../utils/api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExpenseCategory {
  id: number;
  name: string;
  userId: number;
}

// ============================================================================
// Query Keys
// ============================================================================

export const expenseCategoryKeys = {
  all: ['expense-categories'] as const,
};

// ============================================================================
// Queries
// ============================================================================

export const useExpenseCategoriesQuery = () => {
  return useQuery({
    queryKey: expenseCategoryKeys.all,
    queryFn: async (): Promise<ExpenseCategory[]> => {
      const data = await expenseCategoriesAPI.getExpenseCategories();
      return Array.isArray(data) ? data : [];
    },
  });
};

// ============================================================================
// Mutations
// ============================================================================

export const useAddExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await expenseCategoriesAPI.addExpenseCategory(name);
      return (response.category || response) as ExpenseCategory;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
    },
  });
};

export const useDeleteExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await expenseCategoriesAPI.deleteExpenseCategory(id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: expenseCategoryKeys.all });
      const previous = queryClient.getQueryData<ExpenseCategory[]>(expenseCategoryKeys.all);
      queryClient.setQueryData<ExpenseCategory[]>(expenseCategoryKeys.all, (old) =>
        (old ?? []).filter((c) => c.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(expenseCategoryKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
    },
  });
};
