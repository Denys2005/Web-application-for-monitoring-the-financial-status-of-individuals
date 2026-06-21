import React, { useState } from 'react';
import { useAccounts, useAddAccount, useUpdateAccount, useDeleteAccount } from '../../hooks/queries/useAccounts';
import FinancialTable, { ColumnDefinition } from '../../components/Shared/FinancialTable';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currency.utils';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';

const AccountsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currency } = useCurrency();
  const { data: accounts = [], isLoading, error } = useAccounts();
  const addAccountMutation = useAddAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !balance.trim()) return;

    if (editingId) {
      await updateAccountMutation.mutateAsync({ id: editingId, name, balance: parseFloat(balance) });
      setEditingId(null);
    } else {
      await addAccountMutation.mutateAsync({ name, balance: parseFloat(balance) });
    }
    
    setName('');
    setBalance('');
  };

  const handleEdit = (acc: any) => {
    setEditingId(acc.id);
    setName(acc.name);
    setBalance(acc.balance.toString());
  };

  const handleDelete = async (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цей рахунок?')) {
      await deleteAccountMutation.mutateAsync(id);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setBalance('');
  };

  if (isLoading) {
    return (
      <div className="rf-dashboard">
        <Header 
          title="Accounts" 
          hideActions={true} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="rf-dashboard-main">
          <Sidebar 
            mobileOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="rf-dashboard-content bg-black">
            <div className="bg-transparent text-white h-full flex flex-col font-sans">
              <div className="rf-section-header">Accounts</div>
              <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
                <p className="text-center text-[#d4af37] p-5">Loading accounts...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rf-dashboard">
        <Header 
          title="Accounts" 
          hideActions={true} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="rf-dashboard-main">
          <Sidebar 
            mobileOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="rf-dashboard-content bg-black">
            <div className="bg-transparent text-white h-full flex flex-col font-sans">
              <div className="rf-section-header">Accounts</div>
              <div className="rf-error">Error loading accounts.</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const columns: ColumnDefinition<any>[] = [
    { header: 'Account Name', accessor: 'name' },
    { 
      header: 'Balance', 
      accessor: (item) => formatCurrency(item.balance, currency),
      align: 'right'
    },
  ];

  const deletingId = deleteAccountMutation.isPending ? deleteAccountMutation.variables : null;

  return (
    <div className="rf-dashboard">
      <Header 
        title="Accounts" 
        hideActions={true} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="rf-dashboard-main">
        <Sidebar 
          mobileOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="rf-dashboard-content bg-black">
          <div className="bg-transparent text-white h-full flex flex-col font-sans">
            <div className="rf-section-header">Accounts</div>
            <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
              <div className="rf-card">
                <div className="rf-section-header-sm">Manage Accounts</div>
                
                <FinancialTable
                  title=""
                  data={accounts}
                  columns={columns}
                  emptyMessage="You don't have any accounts yet. Create your first account below."
                  onEdit={handleEdit}
                  onDelete={(acc) => handleDelete(acc.id)}
                  editingId={editingId}
                  deletingId={deletingId}
                  noCard={true}
                />

                <form onSubmit={handleSubmit}>
                  <div className="rf-input-row">
                    <input
                      type="text"
                      className="rf-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Account Name (e.g. Monobank)"
                    />
                    <input
                      type="number"
                      className="rf-input"
                      value={balance}
                      onChange={e => setBalance(e.target.value)}
                      placeholder="Initial Balance"
                    />
                  </div>

                  {editingId ? (
                    <div className="rf-edit-actions">
                      <button 
                        type="submit" 
                        className="rf-btn-save"
                        disabled={addAccountMutation.isPending || updateAccountMutation.isPending || !name.trim() || !balance.trim()}
                      >
                        {updateAccountMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        type="button" 
                        className="rf-btn-cancel"
                        onClick={cancelEdit}
                        disabled={updateAccountMutation.isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="submit" 
                      className="rf-btn-primary"
                      disabled={addAccountMutation.isPending || !name.trim() || !balance.trim()}
                    >
                      {addAccountMutation.isPending ? 'Adding...' : '+ Add Account'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountsPage;
