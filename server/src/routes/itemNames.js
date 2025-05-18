import express from 'express';
import ItemName from '../models/ItemName.js';

const router = express.Router();

// Get all item names (simple list)
router.get('/', async (req, res) => {
  try {
    const itemNames = await ItemName.find().sort({ name: 1 });
    const names = itemNames.map(item => item.name);
    res.json(names);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all item names with details
router.get('/details', async (req, res) => {
  try {
    const itemNames = await ItemName.find().sort({ name: 1 });
    res.json(itemNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single item name
router.get('/:id', async (req, res) => {
  try {
    const itemName = await ItemName.findById(req.params.id);
    if (!itemName) {
      return res.status(404).json({ message: 'Item name not found' });
    }
    res.json(itemName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new item name
router.post('/', async (req, res) => {
  const itemName = new ItemName({
    name: req.body.name,
    category: req.body.category,
    unit: req.body.unit,
    description: req.body.description,
    sku: req.body.sku
  });

  try {
    const newItemName = await itemName.save();
    res.status(201).json(newItemName);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an item name
router.put('/:id', async (req, res) => {
  try {
    const itemName = await ItemName.findById(req.params.id);
    if (!itemName) {
      return res.status(404).json({ message: 'Item name not found' });
    }

    if (req.body.name) itemName.name = req.body.name;
    if (req.body.category !== undefined) itemName.category = req.body.category;
    if (req.body.unit !== undefined) itemName.unit = req.body.unit;
    if (req.body.description !== undefined) itemName.description = req.body.description;
    if (req.body.sku !== undefined) itemName.sku = req.body.sku;

    const updatedItemName = await itemName.save();
    res.json(updatedItemName);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an item name
router.delete('/:id', async (req, res) => {
  try {
    const itemName = await ItemName.findById(req.params.id);
    if (!itemName) {
      return res.status(404).json({ message: 'Item name not found' });
    }

    await ItemName.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item name deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;