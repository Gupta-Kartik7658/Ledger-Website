import express from 'express';
import StockTransaction from '../models/StockTransaction.js';
import ItemName from '../models/ItemName.js';

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
  const session = await StockTransaction.startSession();
  session.startTransaction();

  try {
    const { itemName, transactionType, quantity } = req.body;
    
    // Find the item and update its stock
    const item = await ItemName.findOne({ name: itemName });
    if (!item) {
      throw new Error('Item not found');
    }

    // Calculate new stock level
    const stockChange = transactionType === 'In' ? quantity : -quantity;
    const newStock = item.currentStock + stockChange;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    // Create transaction with new stock level
    const transaction = new StockTransaction({
      ...req.body,
      stockAfterTransaction: newStock
    });

    // Update item stock
    item.currentStock = newStock;

    // Save both transaction and updated item
    await Promise.all([
      transaction.save({ session }),
      item.save({ session })
    ]);

    await session.commitTransaction();
    res.status(201).json(transaction);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// Update a stock transaction
router.put('/:id', async (req, res) => {
  const session = await StockTransaction.startSession();
  session.startTransaction();

  try {
    const oldTransaction = await StockTransaction.findById(req.params.id);
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const item = await ItemName.findOne({ name: oldTransaction.itemName });
    if (!item) {
      throw new Error('Item not found');
    }

    // Reverse the old transaction's effect on stock
    const oldStockChange = oldTransaction.transactionType === 'In'
      ? -oldTransaction.quantity
      : oldTransaction.quantity;
    
    // Calculate new transaction's effect
    const newStockChange = req.body.transactionType === 'In'
      ? req.body.quantity
      : -req.body.quantity;

    // Update item stock
    const newStock = item.currentStock + oldStockChange + newStockChange;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    item.currentStock = newStock;

    // Update transaction
    const updatedTransaction = {
      ...req.body,
      stockAfterTransaction: newStock
    };

    const result = await StockTransaction.findByIdAndUpdate(
      req.params.id,
      updatedTransaction,
      { new: true, session }
    );

    await item.save({ session });
    await session.commitTransaction();
    res.json(result);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// Delete a stock transaction
router.delete('/:id', async (req, res) => {
  const session = await StockTransaction.startSession();
  session.startTransaction();

  try {
    const transaction = await StockTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const item = await ItemName.findOne({ name: transaction.itemName });
    if (!item) {
      throw new Error('Item not found');
    }

    // Reverse the transaction's effect on stock
    const stockChange = transaction.transactionType === 'In'
      ? -transaction.quantity
      : transaction.quantity;
    
    const newStock = item.currentStock + stockChange;
    
    if (newStock < 0) {
      throw new Error('Cannot delete transaction: would result in negative stock');
    }

    item.currentStock = newStock;

    await Promise.all([
      StockTransaction.findByIdAndDelete(req.params.id, { session }),
      item.save({ session })
    ]);

    await session.commitTransaction();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

export default router;