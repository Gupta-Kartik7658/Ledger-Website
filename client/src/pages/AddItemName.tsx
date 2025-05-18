import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ActionButtons from '../components/ActionButtons';
import { Plus, X } from 'lucide-react';
import { api } from '../utils/api';

interface ItemName {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
  description?: string;
  sku?: string;
}

const AddItemName: React.FC = () => {
  const [itemNames, setItemNames] = useState<ItemName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentItemName, setCurrentItemName] = useState<Partial<ItemName>>({
    name: '',
    category: '',
    unit: '',
    description: '',
    sku: ''
  });

  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        setLoading(true);
        const response = await api.get('/item-names/details');
        setItemNames(response.data);
      } catch (err) {
        setError('Failed to load item names');
        console.error(err);
        // Mock data for demonstration
        setItemNames([
          {
            _id: '1',
            name: 'Laptop',
            category: 'Electronics',
            unit: 'piece',
            description: 'Business laptops for office use',
            sku: 'LAP-001'
          },
          {
            _id: '2',
            name: 'Office Desk',
            category: 'Furniture',
            unit: 'piece',
            description: 'Standard office desks',
            sku: 'DESK-001'
          },
          {
            _id: '3',
            name: 'Printer Paper',
            category: 'Office Supplies',
            unit: 'ream',
            description: 'A4 printer paper, 500 sheets per ream',
            sku: 'PAP-001'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchItemNames();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentItemName({
      name: '',
      category: '',
      unit: '',
      description: '',
      sku: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (itemName: ItemName) => {
    setIsEditing(true);
    setCurrentItemName({ ...itemName });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentItemName(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentItemName._id) {
        // Update existing item name
        await api.put(`/item-names/${currentItemName._id}`, currentItemName);
      } else {
        // Create new item name
        await api.post('/item-names', currentItemName);
      }
      
      // Refresh data
      const response = await api.get('/item-names/details');
      setItemNames(response.data);
      closeModal();
    } catch (err) {
      console.error('Failed to save item name:', err);
      // For demo, simulate successful save without API
      if (isEditing) {
        const updatedItemNames = itemNames.map(item => 
          item._id === currentItemName._id ? { ...currentItemName as ItemName } : item
        );
        setItemNames(updatedItemNames);
      } else {
        const newItemName = {
          ...currentItemName,
          _id: Date.now().toString(),
        } as ItemName;
        setItemNames([...itemNames, newItemName]);
      }
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item name?')) {
      return;
    }
    
    try {
      await api.delete(`/item-names/${id}`);
      
      // Update state after successful deletion
      setItemNames(itemNames.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete item name:', err);
      // For demo, simulate successful deletion without API
      setItemNames(itemNames.filter(item => item._id !== id));
    }
  };

  // Filter item names based on search query
  const filteredItemNames = itemNames.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group items by category
  const groupedItems: Record<string, ItemName[]> = {};
  filteredItemNames.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Item Name"
        subtitle="Manage item names for stock ledger transactions"
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            className="block w-full pl-4 pr-10 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search items by name, category, or SKU..."
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
          {filteredItemNames.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No item names found. Click "Add Item" to create one.
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="bg-white shadow sm:rounded-md overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-primary-700">{item.name}</div>
                              {item.sku && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  SKU: {item.sku}
                                </span>
                              )}
                            </div>
                            {item.unit && (
                              <div className="text-sm text-gray-500">Unit: {item.unit}</div>
                            )}
                          </div>
                          <div className="flex space-x-4">
                            <ActionButtons
                              onEdit={() => openEditModal(item)}
                              onDelete={() => handleDelete(item._id)}
                              withLabels={true}
                            />
                          </div>
                        </div>
                        {item.description && (
                          <div className="mt-2 text-sm text-gray-500">
                            <span className="text-gray-400 mr-1">Description:</span> {item.description}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Item Name Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full m-4 p-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Item' : 'Add New Item'}
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
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Item name"
                    value={currentItemName.name || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      id="category"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Category"
                      value={currentItemName.category || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <input
                      type="text"
                      name="unit"
                      id="unit"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., piece, kg, box"
                      value={currentItemName.unit || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU/Item Code
                  </label>
                  <input
                    type="text"
                    name="sku"
                    id="sku"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Stock Keeping Unit"
                    value={currentItemName.sku || ''}
                    onChange={handleInputChange}
                  />
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
                    placeholder="Item description"
                    value={currentItemName.description || ''}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isEditing ? 'Save Changes' : 'Add Item'}
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

export default AddItemName;