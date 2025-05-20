import express from 'express';
import AccountTransaction from '../models/AccountTransaction.js';
import AccountName from '../models/AccountName.js';

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
  const session = await AccountTransaction.startSession();
  session.startTransaction();

  try {
    const { accountName, transactionType, amount } = req.body;
    
    // Find the account and update its balance
    const account = await AccountName.findOne({ name: accountName });
    if (!account) {
      throw new Error('Account not found');
    }

    // Calculate new balance - Credit decreases balance, Debit increases balance
    const balanceChange = transactionType === 'Credit' ? -amount : amount;
    const newBalance = account.currentBalance + balanceChange;

    // Create transaction with new balance
    const transaction = new AccountTransaction({
      ...req.body,
      balanceAfterTransaction: newBalance
    });

    // Update account balance
    account.currentBalance = newBalance;

    // Save both transaction and updated account
    await Promise.all([
      transaction.save({ session }),
      account.save({ session })
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

// Update an account transaction
router.put('/:id', async (req, res) => {
  const session = await AccountTransaction.startSession();
  session.startTransaction();

  try {
    const oldTransaction = await AccountTransaction.findById(req.params.id);
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const account = await AccountName.findOne({ name: oldTransaction.accountName });
    if (!account) {
      throw new Error('Account not found');
    }

    // Reverse the old transaction's effect on balance
    const oldBalanceChange = oldTransaction.transactionType === 'Credit' 
      ? oldTransaction.amount 
      : -oldTransaction.amount;
    
    // Calculate new transaction's effect
    const newBalanceChange = req.body.transactionType === 'Credit'
      ? -req.body.amount
      : req.body.amount;

    // Update account balance
    account.currentBalance = account.currentBalance + oldBalanceChange + newBalanceChange;

    // Update transaction
    const updatedTransaction = {
      ...req.body,
      balanceAfterTransaction: account.currentBalance
    };

    const result = await AccountTransaction.findByIdAndUpdate(
      req.params.id,
      updatedTransaction,
      { new: true, session }
    );

    await account.save({ session });
    await session.commitTransaction();
    res.json(result);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// Delete an account transaction
router.delete('/:id', async (req, res) => {
  const session = await AccountTransaction.startSession();
  session.startTransaction();

  try {
    const transaction = await AccountTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const account = await AccountName.findOne({ name: transaction.accountName });
    if (!account) {
      throw new Error('Account not found');
    }

    // Reverse the transaction's effect on balance
    const balanceChange = transaction.transactionType === 'Credit'
      ? transaction.amount
      : -transaction.amount;
    
    account.currentBalance += balanceChange;

    await Promise.all([
      AccountTransaction.findByIdAndDelete(req.params.id, { session }),
      account.save({ session })
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