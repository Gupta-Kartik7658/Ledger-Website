import express from 'express';
import AccountName from '../models/AccountName.js';

const router = express.Router();

// Get all account names (simple list)
router.get('/', async (req, res) => {
  try {
    const accountNames = await AccountName.find().sort({ name: 1 });
    const names = accountNames.map(account => account.name);
    res.json(names);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all account names with details
router.get('/details', async (req, res) => {
  try {
    const accountNames = await AccountName.find().sort({ name: 1 });
    res.json(accountNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single account name
router.get('/:id', async (req, res) => {
  try {
    const accountName = await AccountName.findById(req.params.id);
    if (!accountName) {
      return res.status(404).json({ message: 'Account name not found' });
    }
    res.json(accountName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new account name
router.post('/', async (req, res) => {
  const accountName = new AccountName({
    name: req.body.name,
    contactPerson: req.body.contactPerson,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  });

  try {
    const newAccountName = await accountName.save();
    res.status(201).json(newAccountName);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an account name
router.put('/:id', async (req, res) => {
  try {
    const accountName = await AccountName.findById(req.params.id);
    if (!accountName) {
      return res.status(404).json({ message: 'Account name not found' });
    }

    if (req.body.name) accountName.name = req.body.name;
    if (req.body.contactPerson !== undefined) accountName.contactPerson = req.body.contactPerson;
    if (req.body.email !== undefined) accountName.email = req.body.email;
    if (req.body.phone !== undefined) accountName.phone = req.body.phone;
    if (req.body.address !== undefined) accountName.address = req.body.address;

    const updatedAccountName = await accountName.save();
    res.json(updatedAccountName);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an account name
router.delete('/:id', async (req, res) => {
  try {
    const accountName = await AccountName.findById(req.params.id);
    if (!accountName) {
      return res.status(404).json({ message: 'Account name not found' });
    }

    await AccountName.findByIdAndDelete(req.params.id);
    res.json({ message: 'Account name deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;