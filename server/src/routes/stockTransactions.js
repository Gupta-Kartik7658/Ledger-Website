import express from 'express';
import StockTransaction from '../models/StockTransaction.js';

const router = express.Router();

// Get all stock transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await StockTransaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single stock transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new stock transaction
router.post('/', async (req, res) => {
  const transaction = new StockTransaction({
    date: req.body.date,
    itemName: req.body.itemName,
    transactionType: req.body.transactionType,
    quantity: req.body.quantity,
    unitPrice: req.body.unitPrice,
    description: req.body.description
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a stock transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.body.date) transaction.date = req.body.date;
    if (req.body.itemName) transaction.itemName = req.body.itemName;
    if (req.body.transactionType) transaction.transactionType = req.body.transactionType;
    if (req.body.quantity) transaction.quantity = req.body.quantity;
    if (req.body.unitPrice) transaction.unitPrice = req.body.unitPrice;
    if (req.body.description !== undefined) transaction.description = req.body.description;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a stock transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await StockTransaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;