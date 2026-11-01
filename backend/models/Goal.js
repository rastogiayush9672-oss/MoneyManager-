const mongoose = require('mongoose');

const GoalContributionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' }
}, { _id: false });

const GoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 1 },
  currentAmount: { type: Number, default: 0, min: 0 },
  targetDate: { type: Date, required: true },
  monthlyContribution: { type: Number, default: 0 },
  category: { 
    type: String, 
    enum: ['Emergency Fund', 'New Laptop', 'New Phone', 'Vacation', 'Higher Education', 'Personal Savings', 'Vehicle', 'Home', 'Investment', 'Other'], 
    default: 'Personal Savings' 
  },
  isCompleted: { type: Boolean, default: false },
  history: [GoalContributionSchema]
}, { timestamps: true });

GoalSchema.index({ user: 1, isCompleted: 1 });

module.exports = mongoose.model('Goal', GoalSchema);
