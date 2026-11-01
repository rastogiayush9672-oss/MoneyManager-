const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, trim: true },
  limit: { type: Number, required: true, min: 0 },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  alertThreshold: { type: Number, default: 80 } // Alert when reached 80%
}, { timestamps: true });

BudgetSchema.index({ user: 1, year: 1, month: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
