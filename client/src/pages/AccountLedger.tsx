import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import FilterBar from '../components/FilterBar';
import ActionButtons, { ExportButton } from '../components/ActionButtons';
import { Plus, X } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import { api } from '../utils/api';
import { exportToExcel } from '../utils/excelExport';

interface AccountTransaction {
  _id: string;
  date: string;
  accountName: string;
  transactionType: string;
  amount: number;
  description: string;
}

const TRANSACTION_TYPES = ['Credit', 'Debit'];

const AccountLedger: React.FC = () => {
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Partial<AccountTransaction>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    accountName: '',
    transactionType: 'Credit',
    amount: 0,
    description: ''
  });
  const [accountNames, setAccountNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch transactions
        const [transactionsResponse, accountNamesResponse] = await Promise.all([
          api.get('/account-transactions'),
          api.get('/account-names')
        ]);
        
        setTransactions(transactionsResponse.data);
        setFilteredTransactions(transactionsResponse.data);
        setAccountNames(accountNamesResponse.data);
      } catch (err) {
        setError('Failed to load account ledger data');
        console.error(err);
        // Mock data for demonstration
        const mockTransactions = [
          {
            _id: '1',
            date: '2023-11-15',
            accountName: 'ABC Company',
            transactionType: 'Credit',
            amount: 5000,
            description: 'Payment received'
          },
          {
            _id: '2',
            date: '2023-11-14',
            accountName: 'XYZ Suppliers',
            transactionType: 'Debit',
            amount: 2500,
            description: 'Payment made'
          },
          {
            _id: '3',
            date: '2023-11-12',
            accountName: 'John Doe',
            transactionType: 'Credit',
            amount: 1200,
            description: 'Consulting fee'
          }
        ];
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        setAccountNames(['ABC Company', 'XYZ Suppliers', 'John Doe', 'Acme Inc']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredTransactions(transactions);
      return;
    }
    
    const filtered = transactions.filter(transaction =>
      transaction.accountName.toLowerCase().includes(query.toLowerCase()) ||
      transaction.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  const handleTypeFilter = (type: string) => {
    if (!type) {
      setFilteredTransactions(transactions);
      return;
    }
    
    const filtered = transactions.filter(transaction =>
      transaction.transactionType === type
    );
    setFilteredTransactions(filtered);
  };

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate && !endDate) {
      setFilteredTransactions(transactions);
      return;
    }
    
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (startDate && endDate) {
        return transactionDate >= startDate && transactionDate <= endDate;
      } else if (startDate) {
        return transactionDate >= startDate;
      } else if (endDate) {
        return transactionDate <= endDate;
      }
      
      return true;
    });
    
    setFilteredTransactions(filtered);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentTransaction({
      date: format(new Date(), 'yyyy-MM-dd'),
      accountName: '',
      transactionType: 'Credit',
      amount: 0,
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: AccountTransaction) => {
    setIsEditing(true);
    setCurrentTransaction({
      ...transaction,
      date: format(new Date(transaction.date), 'yyyy-MM-dd')
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleAccountNameChange = (value: string) => {
    setCurrentTransaction(prev => ({
      ...prev,
      accountName: value
    }));
  };

  const handleTransactionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTransaction(prev => ({
      ...prev,
      transactionType: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentTransaction._id) {
        // Update existing transaction
        await api.put(`/account-transactions/${currentTransaction._id}`, currentTransaction);
      } else {
        // Create new transaction
        await api.post('/account-transactions', currentTransaction);
      }
      
      // Refresh data
      const response = await api.get('/account-transactions');
      setTransactions(response.data);
      setFilteredTransactions(response.data);
      closeModal();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      // For demo, simulate successful save without API
      if (isEditing) {
        const updatedTransactions = transactions.map(t => 
          t._id === currentTransaction._id ? { ...currentTransaction as AccountTransaction } : t
        );
        setTransactions(updatedTransactions);
        setFilteredTransactions(updatedTransactions);
      } else {
        const newTransaction = {
          ...currentTransaction,
          _id: Date.now().toString(),
        } as AccountTransaction;
        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        setFilteredTransactions(updatedTransactions);
      }
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await api.delete(`/account-transactions/${id}`);
      
      // Update state after successful deletion
      const updatedTransactions = transactions.filter(t => t._id !== id);
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      // For demo, simulate successful deletion without API
      const updatedTransactions = transactions.filter(t => t._id !== id);
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
    }
  };

  const handleExport = () => {
    exportToExcel(
      filteredTransactions,
      [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Account Name', key: 'accountName', width: 30 },
        { header: 'Type', key: 'transactionType', width: 10 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Description', key: 'description', width: 40 }
      ],
      'Account_Ledger'
    );
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Account Ledger"
        subtitle="Manage and track financial transactions"
        actions={
          <div className="flex space-x-3">
            <ExportButton onClick={handleExport} />
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </button>
          </div>
        }
      />

      <FilterBar
        onSearch={handleSearch}
        onTypeFilter={handleTypeFilter}
        onDateRangeChange={handleDateRangeChange}
        transactionTypes={TRANSACTION_TYPES}
      />

      {loading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Account Name</th>
                <th scope="col">Type</th>
                <th scope="col">Amount</th>
                <th scope="col">Description</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">No transactions found</td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="font-medium text-gray-900">{transaction.accountName}</td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.transactionType === 'Credit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className="font-medium">
                      ${transaction.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="truncate max-w-xs">{transaction.description}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => openEditModal(transaction)}
                        onDelete={() => handleDelete(transaction._id)}
                        small={true}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full m-4 p-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={closeModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={currentTransaction.date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <Dropdown
                    options={accountNames}
                    value={currentTransaction.accountName || ''}
                    onChange={handleAccountNameChange}
                    placeholder="Select or enter an account name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
                    Transaction Type
                  </label>
                  <select
                    id="transactionType"
                    name="transactionType"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={currentTransaction.transactionType}
                    onChange={handleTransactionTypeChange}
                  >
                    {TRANSACTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      min="0"
                      step="0.01"
                      required
                      className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                      value={currentTransaction.amount}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Transaction details..."
                    value={currentTransaction.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isEditing ? 'Save Changes' : 'Add Transaction'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLedger;