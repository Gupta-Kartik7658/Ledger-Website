import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import accountTransactionRoutes from './routes/accountTransactions.js';
import stockTransactionRoutes from './routes/stockTransactions.js';
import accountNameRoutes from './routes/accountNames.js';
import itemNameRoutes from './routes/itemNames.js';
import dashboardRoutes from './routes/dashboard.js';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log environment variables for debugging
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-ledger')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/account-transactions', accountTransactionRoutes);
app.use('/api/stock-transactions', stockTransactionRoutes);
app.use('/api/account-names', accountNameRoutes);
app.use('/api/item-names', itemNameRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('MERN Ledger API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});