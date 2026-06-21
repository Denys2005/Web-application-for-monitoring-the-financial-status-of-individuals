import React, { useState } from 'react';
import {
  useExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  ExpenseItem,
} from '../../hooks/queries/useExpenses';
import {
  useExpenseCategoriesQuery,
  useAddExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} from '../../hooks/queries/useExpenseCategories';
import { useAccounts } from '../../hooks/queries/useAccounts';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currency.utils';
import FinancialTable, { ColumnDefinition } from '../Shared/FinancialTable';

const ExpenseSection: React.FC = () => {
  const { currency } = useCurrency();

  // Expense hooks
  const { data: expenses, isLoading, error: queryError } = useExpensesQuery();
  const addExpenseMutation = useAddExpenseMutation();
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();

  // Category hooks
  const { data: categories = [] } = useExpenseCategoriesQuery();
  const addCategoryMutation = useAddExpenseCategoryMutation();
  const deleteCategoryMutation = useDeleteExpenseCategoryMutation();

  // Account hooks
  const { data: accounts = [] } = useAccounts();

  // Expense form state
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // ── Category handlers ──────────────────────────────────────────────
  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || addCategoryMutation.isPending) return;
    try {
      setCategoryError(null);
      await addCategoryMutation.mutateAsync(trimmed);
      setNewCategoryName('');
    } catch {
      setCategoryError('Не вдалося додати категорію');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (deleteCategoryMutation.isPending) return;
    try {
      setCategoryError(null);
      await deleteCategoryMutation.mutateAsync(id);
      // If the deleted category was selected, clear selection
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    } catch {
      setCategoryError('Не вдалося видалити категорію');
    }
  };

  // ── Expense handlers ───────────────────────────────────────────────
  const handleAddExpense = async () => {
    const finalName = name.trim() || (selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : '') || '';
    if (!finalName || !amount.trim() || addExpenseMutation.isPending) return;
    try {
      setLocalError(null);
      await addExpenseMutation.mutateAsync({
        name: finalName,
        amount: parseFloat(amount),
        categoryId: selectedCategoryId,
        accountId: selectedAccountId,
      });
      setName('');
      setAmount('');
      setSelectedCategoryId(null);
      setSelectedAccountId(null);
    } catch {
      setLocalError('Не вдалося додати витрату');
    }
  };

  const handleUpdateExpense = async () => {
    const finalName = name.trim() || (selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : '') || '';
    if (!editingItem || !finalName || !amount.trim() || updateExpenseMutation.isPending) return;
    try {
      setLocalError(null);
      await updateExpenseMutation.mutateAsync({
        id: editingItem.id,
        name: finalName,
        amount: parseFloat(amount),
        categoryId: selectedCategoryId,
        accountId: selectedAccountId,
      });
      setEditingItem(null);
      setName('');
      setAmount('');
      setSelectedCategoryId(null);
      setSelectedAccountId(null);
    } catch {
      setLocalError('Не вдалося оновити витрату');
    }
  };

  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setName(item.name);
    setAmount(item.amount.toString());
    setSelectedCategoryId(item.categoryId ?? null);
    setSelectedAccountId(item.accountId ?? null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setName('');
    setAmount('');
    setSelectedCategoryId(null);
    setSelectedAccountId(null);
  };

  const handleDelete = async (item: ExpenseItem) => {
    if (deleteExpenseMutation.isPending) return;
    try {
      setLocalError(null);
      await deleteExpenseMutation.mutateAsync({ id: item.id });
    } catch {
      setLocalError('Не вдалося видалити витрату');
    }
  };

  // ── Table columns ──────────────────────────────────────────────────
  const columns: ColumnDefinition<ExpenseItem>[] = [
    {
      header: 'Name',
      accessor: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {item.name}
          {item.categoryName && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              {item.categoryName}
            </span>
          )}
          {item.accountName && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '999px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#93c5fd',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              {item.accountName}
            </span>
          )}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: (item) => formatCurrency(item.amount, currency),
      align: 'right',
    },
  ];

  const deletingId = deleteExpenseMutation.isPending ? deleteExpenseMutation.variables?.id : null;

  if (isLoading) {
    return (
      <div className="bg-transparent text-white h-full flex flex-col font-sans">
        <div className="rf-section-header">Expenses</div>
        <div className="rf-card flex-1 flex flex-col">
          <p className="text-center text-[#d4af37] p-5">Loading expenses...</p>
        </div>
      </div>
    );
  }

  const displayError =
    localError || (queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null);

  const expenseData = expenses ?? [];

  return (
    <div className="bg-transparent text-white h-full flex flex-col font-sans">
      <div className="rf-section-header">Expenses</div>

      {displayError && <div className="rf-error">{displayError}</div>}

      {/* ── CATEGORIES BLOCK (top) ──────────────────────────────────── */}
      <div className="rf-card" style={{ marginBottom: '10px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#6ee7b7',
            marginBottom: '8px',
          }}
        >
          Категорії витрат
        </div>

        {categoryError && (
          <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '6px' }}>{categoryError}</div>
        )}

        {/* Existing categories as chips */}
        {categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '10px',
            }}
          >
            {categories.map((cat) => (
              <span
                key={cat.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 10px 3px 10px',
                  borderRadius: '999px',
                  background:
                    selectedCategoryId === cat.id
                      ? 'rgba(16, 185, 129, 0.30)'
                      : 'rgba(16, 185, 129, 0.10)',
                  color: selectedCategoryId === cat.id ? '#a7f3d0' : '#6ee7b7',
                  border:
                    selectedCategoryId === cat.id
                      ? '1px solid rgba(16, 185, 129, 0.6)'
                      : '1px solid rgba(16, 185, 129, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() =>
                  setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)
                }
              >
                {cat.name}
                <button
                  aria-label={`Delete ${cat.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id);
                  }}
                  disabled={deleteCategoryMutation.isPending}
                  style={{
                    marginLeft: '2px',
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '11px',
                    lineHeight: 1,
                    padding: '0 1px',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add new category */}
        <div className="rf-input-row">
          <input
            className="rf-input"
            type="text"
            placeholder="Нова категорія (напр. Ресторани)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            className="rf-btn-primary"
            style={{ whiteSpace: 'nowrap', minWidth: '90px' }}
            onClick={handleAddCategory}
            disabled={addCategoryMutation.isPending || !newCategoryName.trim()}
          >
            {addCategoryMutation.isPending ? '...' : '+ Категорія'}
          </button>
        </div>
      </div>

      {/* ── EXPENSES BLOCK (bottom) ─────────────────────────────────── */}
      <div className="rf-card flex-1 flex flex-col">
        <FinancialTable
          title=""
          data={expenseData}
          columns={columns}
          emptyMessage="No expenses added yet."
          onEdit={handleEdit}
          onDelete={handleDelete}
          editingId={editingItem?.id ?? null}
          deletingId={deletingId ?? null}
          noCard={true}
        />

        {/* Expense input row */}
        <div className="rf-input-row">
          <input
            className="rf-input"
            type="text"
            placeholder="Назва витрати"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rf-input"
            type="number"
            placeholder="Сума"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="rf-input"
            style={{ appearance: 'auto', backgroundColor: '#1e293b' }}
            value={selectedCategoryId || ''}
            onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Без категорії</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            className="rf-input"
            style={{ appearance: 'auto', backgroundColor: '#1e293b' }}
            value={selectedAccountId || ''}
            onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Без рахунку</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {editingItem !== null ? (
          <div className="rf-edit-actions">
            <button
              className="rf-btn-save"
              onClick={handleUpdateExpense}
              disabled={updateExpenseMutation.isPending || (!name.trim() && !selectedCategoryId) || !amount.trim()}
            >
              {updateExpenseMutation.isPending && updateExpenseMutation.variables?.id === editingItem?.id
                ? 'Saving...'
                : 'Save'}
            </button>
            <button
              className="rf-btn-cancel"
              onClick={handleCancelEdit}
              disabled={updateExpenseMutation.isPending}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="rf-btn-primary"
            onClick={handleAddExpense}
            disabled={addExpenseMutation.isPending || (!name.trim() && !selectedCategoryId) || !amount.trim() || editingItem !== null}
          >
            {addExpenseMutation.isPending ? 'Adding...' : '+ Add Expense'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseSection;
