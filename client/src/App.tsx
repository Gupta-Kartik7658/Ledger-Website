import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AccountLedger from './pages/AccountLedger';
import StockLedger from './pages/StockLedger';
import AddAccountName from './pages/AddAccountName';
import AddItemName from './pages/AddItemName';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/account-ledger" element={<AccountLedger />} />
        <Route path="/stock-ledger" element={<StockLedger />} />
        <Route path="/add-account-name" element={<AddAccountName />} />
        <Route path="/add-item-name" element={<AddItemName />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;