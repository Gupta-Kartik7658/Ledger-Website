import express from 'express';
import AccountTransaction from '../models/AccountTransaction.js';
import StockTransaction from '../models/StockTransaction.js';
import AccountName from '../models/AccountName.js';
import ItemName from '../models/ItemName.js';

const router = express.Router();

// Get dashboard summary data
router.get('/', async (req, res) => {
  try {
    // Get counts
    const [
      accountNames,
      itemNames,
      accountTransactions,
      stockTransactions,
      recentAccountTransactions,
      recentStockTransactions
    ] = await Promise.all([
      AccountName.countDocuments(),
      ItemName.countDocuments(),
      AccountTransaction.countDocuments(),
      StockTransaction.countDocuments(),
      AccountTransaction.find().sort({ date: -1 }).limit(4),
      StockTransaction.find().sort({ date: -1 }).limit(4)
    ]);

    res.json({
      totalAccounts: accountNames,
      totalItems: itemNames,
      totalAccountTransactions: accountTransactions,
      totalStockTransactions: stockTransactions,
      recentAccountTransactions,
      recentStockTransactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;