const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true, trim: true },
  subCategory: { type: String, default: '', trim: true },
  paymentMethod: { 
    type: String, 
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Bank Transfer', 'Cheque', 'Other'], 
    default: 'UPI' 
  },
  isEssential: { type: Boolean, default: true },
  merchant: { type: String, default: '', trim: true },
  notes: { type: String, default: '', trim: true },
  date: { type: Date, default: Date.now, index: true },
  recurring: { type: Boolean, default: false },
  frequency: { 
    type: String, 
    enum: ['one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'], 
    default: 'one-time' 
  },
  receiptUrl: { type: String, default: '' }
}, { timestamps: true });

// Compound index for fast user + date querying
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
