const mongoose = require('mongoose');

const AssetLiabilitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['asset', 'liability'], required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      // Assets
      'Cash & Bank Balance',
      'Fixed Deposits & RD',
      'Mutual Funds & SIP',
      'Stocks & Equity',
      'Provident Fund & PPF',
      'Real Estate & Property',
      'Gold & Precious Metals',
      'Cryptocurrency',
      'Other Assets',
      // Liabilities
      'Home Loan',
      'Personal Loan',
      'Education Loan',
      'Car / Vehicle Loan',
      'Credit Card Outstanding',
      'Other Liabilities'
    ]
  },
  name: { type: String, required: true, trim: true },
  value: { type: Number, required: true, min: 0 },
  institution: { type: String, default: '', trim: true }, // e.g. HDFC Bank, Zerodha, SBI
  interestRate: { type: Number, default: 0 }, // For loans or FDs (%)
  notes: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

AssetLiabilitySchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('AssetLiability', AssetLiabilitySchema);
