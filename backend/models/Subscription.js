const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly', 'quarterly', 'weekly'], 
    default: 'monthly' 
  },
  category: { 
    type: String, 
    enum: ['Streaming', 'Software', 'Utilities', 'Rent', 'Mobile & Internet', 'Insurance', 'Loan EMI', 'Gym & Fitness', 'Other'], 
    default: 'Streaming' 
  },
  nextDueDate: { type: Date, required: true },
  paymentMethod: { type: String, default: 'Auto-Debit / Credit Card' },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  remindDaysBefore: { type: Number, default: 3 },
  notes: { type: String, default: '' },
  paymentHistory: [{
    paidDate: { type: Date, default: Date.now },
    amount: { type: Number },
    status: { type: String, default: 'paid' }
  }]
}, { timestamps: true });

SubscriptionSchema.index({ user: 1, nextDueDate: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
