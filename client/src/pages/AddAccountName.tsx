import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ActionButtons from '../components/ActionButtons';
import { Plus, X } from 'lucide-react';
import { api } from '../utils/api';

interface AccountName {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const AddAccountName: React.FC = () => {
  const [accountNames, setAccountNames] = useState<AccountName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAccountName, setCurrentAccountName] = useState<Partial<AccountName>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchAccountNames = async () => {
      try {
        setLoading(true);
        const response = await api.get('/account-names/details');
        setAccountNames(response.data);
      } catch (err) {
        setError('Failed to load account names');
        console.error(err);
        // Mock data for demonstration
        setAccountNames([
          {
            _id: '1',
            name: 'ABC Company',
            contactPerson: 'John Smith',
            email: 'john@abccompany.com',
            phone: '555-123-4567',
            address: '123 Business St, City, State'
          },
          {
            _id: '2',
            name: 'XYZ Suppliers',
            contactPerson: 'Jane Doe',
            email: 'jane@xyzsuppliers.com',
            phone: '555-987-6543',
            address: '456 Vendor Ave, Town, State'
          },
          {
            _id: '3',
            name: 'Acme Inc',
            contactPerson: 'Robert Johnson',
            email: 'robert@acmeinc.com',
            phone: '555-456-7890',
            address: '789 Corporate Blvd, City, State'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountNames();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentAccountName({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (accountName: AccountName) => {
    setIsEditing(true);
    setCurrentAccountName({ ...accountName });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentAccountName(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentAccountName._id) {
        // Update existing account name
        await api.put(`/account-names/${currentAccountName._id}`, currentAccountName);
      } else {
        // Create new account name
        await api.post('/account-names', currentAccountName);
      }
      
      // Refresh data
      const response = await api.get('/account-names/details');
      setAccountNames(response.data);
      closeModal();
    } catch (err) {
      console.error('Failed to save account name:', err);
      // For demo, simulate successful save without API
      if (isEditing) {
        const updatedAccountNames = accountNames.map(account => 
          account._id === currentAccountName._id ? { ...currentAccountName as AccountName } : account
        );
        setAccountNames(updatedAccountNames);
      } else {
        const newAccountName = {
          ...currentAccountName,
          _id: Date.now().toString(),
        } as AccountName;
        setAccountNames([...accountNames, newAccountName]);
      }
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account name?')) {
      return;
    }
    
    try {
      await api.delete(`/account-names/${id}`);
      
      // Update state after successful deletion
      setAccountNames(accountNames.filter(account => account._id !== id));
    } catch (err) {
      console.error('Failed to delete account name:', err);
      // For demo, simulate successful deletion without API
      setAccountNames(accountNames.filter(account => account._id !== id));
    }
  };

  // Filter account names based on search query
  const filteredAccountNames = accountNames.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.contactPerson && account.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (account.email && account.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Party Name"
        subtitle="Manage party names for account ledger transactions"
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Party
          </button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            className="block w-full pl-4 pr-10 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search party names..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

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
        <>
          {filteredAccountNames.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No party names found. Click "Add Party" to create one.
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
              <ul className="divide-y divide-gray-200">
                {filteredAccountNames.map((account) => (
                  <li key={account._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-primary-700">{account.name}</div>
                        {account.contactPerson && (
                          <div className="text-sm text-gray-500">Contact: {account.contactPerson}</div>
                        )}
                      </div>
                      <div className="flex space-x-4">
                        <ActionButtons
                          onEdit={() => openEditModal(account)}
                          onDelete={() => handleDelete(account._id)}
                          withLabels={true}
                        />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        {account.email && (
                          <div className="flex items-center text-sm text-gray-500 mr-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {account.email}
                          </div>
                        )}
                        {account.phone && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {account.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    {account.address && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="text-gray-400 mr-1">Address:</span> {account.address}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Account Name Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full m-4 p-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Party' : 'Add New Party'}
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Party Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Company or individual name"
                    value={currentAccountName.name || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    id="contactPerson"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Primary contact name"
                    value={currentAccountName.contactPerson || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="contact@example.com"
                      value={currentAccountName.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="555-123-4567"
                      value={currentAccountName.phone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Street, City, State, ZIP"
                    value={currentAccountName.address || ''}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isEditing ? 'Save Changes' : 'Add Party'}
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

export default AddAccountName;