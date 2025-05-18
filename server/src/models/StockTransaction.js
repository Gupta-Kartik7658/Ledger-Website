import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['In', 'Out']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for calculating total value
stockTransactionSchema.virtual('totalValue').get(function() {
  return this.quantity * this.unitPrice;
});

// Virtual for formatting the date (if needed)
stockTransactionSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

export default StockTransaction;