import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { ArrowUpRight, Bookmark, Package, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';

interface DashboardSummary {
  totalAccounts: number;
  totalItems: number;
  totalAccountTransactions: number;
  totalStockTransactions: number;
  recentAccountTransactions: Array<{
    _id: string;
    date: string;
    accountName: string;
    transactionType: string;
    amount: number;
  }>;
  recentStockTransactions: Array<{
    _id: string;
    date: string;
    itemName: string;
    transactionType: string;
    quantity: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard');
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
        // Use mock data for demonstration
        setSummary({
          totalAccounts: 24,
          totalItems: 37,
          totalAccountTransactions: 156,
          totalStockTransactions: 89,
          recentAccountTransactions: [
            {
              _id: '1',
              date: '2023-11-15',
              accountName: 'ABC Company',
              transactionType: 'Credit',
              amount: 5000
            },
            {
              _id: '2',
              date: '2023-11-14',
              accountName: 'XYZ Suppliers',
              transactionType: 'Debit',
              amount: 2500
            },
            {
              _id: '3',
              date: '2023-11-12',
              accountName: 'John Doe',
              transactionType: 'Credit',
              amount: 1200
            },
            {
              _id: '4',
              date: '2023-11-10',
              accountName: 'Acme Inc',
              transactionType: 'Debit',
              amount: 3600
            }
          ],
          recentStockTransactions: [
            {
              _id: '1',
              date: '2023-11-15',
              itemName: 'Laptop',
              transactionType: 'Out',
              quantity: 5
            },
            {
              _id: '2',
              date: '2023-11-14',
              itemName: 'Desk Chair',
              transactionType: 'In',
              quantity: 10
            },
            {
              _id: '3',
              date: '2023-11-12',
              itemName: 'Printer',
              transactionType: 'Out',
              quantity: 2
            },
            {
              _id: '4',
              date: '2023-11-10',
              itemName: 'Headphones',
              transactionType: 'In',
              quantity: 20
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { name: 'Total Accounts', value: summary?.totalAccounts || 0, icon: <Bookmark className="h-6 w-6 text-blue-500" /> },
    { name: 'Total Items', value: summary?.totalItems || 0, icon: <Package className="h-6 w-6 text-green-500" /> },
    { name: 'Account Transactions', value: summary?.totalAccountTransactions || 0, icon: <DollarSign className="h-6 w-6 text-purple-500" /> },
    { name: 'Stock Transactions', value: summary?.totalStockTransactions || 0, icon: <TrendingUp className="h-6 w-6 text-amber-500" /> }
  ];

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your financial and inventory data"
      />

      {loading ? (
        <div className="flex justify-center mt-10">
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
          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stat.value.toLocaleString()}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Account Transactions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-white flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Account Transactions</h3>
                <Link to="/account-ledger" className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
                  View all <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary?.recentAccountTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.accountName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.transactionType === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.transactionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Stock Transactions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-white flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Stock Transactions</h3>
                <Link to="/stock-ledger" className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
                  View all <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary?.recentStockTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.itemName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.transactionType === 'In' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.transactionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.quantity.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;