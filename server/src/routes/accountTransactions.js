import express from 'express';
import AccountTransaction from '../models/AccountTransaction.js';

const router = express.Router();

// Get all account transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await AccountTransaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single account transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await AccountTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new account transaction
router.post('/', async (req, res) => {
  const transaction = new AccountTransaction({
    date: req.body.date,
    accountName: req.body.accountName,
    transactionType: req.body.transactionType,
    amount: req.body.amount,
    description: req.body.description
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an account transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await AccountTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.body.date) transaction.date = req.body.date;
    if (req.body.accountName) transaction.accountName = req.body.accountName;
    if (req.body.transactionType) transaction.transactionType = req.body.transactionType;
    if (req.body.amount) transaction.amount = req.body.amount;
    if (req.body.description !== undefined) transaction.description = req.body.description;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an account transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await AccountTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await AccountTransaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;