import mongoose from 'mongoose';

const accountNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  initialBalance: {
    type: Number,
    required: true,
    default: 0
  },
  currentBalance: {
    type: Number,
    required: true,
    default: 0
  },
  contactPerson: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AccountName = mongoose.model('AccountName', accountNameSchema);

export default AccountName;