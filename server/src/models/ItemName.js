import mongoose from 'mongoose';

const itemNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ItemName = mongoose.model('ItemName', itemNameSchema);

export default ItemName;