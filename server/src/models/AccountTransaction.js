import mongoose from 'mongoose';

const accountTransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['Credit', 'Debit']
  },
  amount: {
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

// Virtual for formatting the date (if needed)
accountTransactionSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

const AccountTransaction = mongoose.model('AccountTransaction', accountTransactionSchema);

export default AccountTransaction;