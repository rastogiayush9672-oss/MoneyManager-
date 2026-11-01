const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  dateFormat: { type: String, default: 'DD/MM/YYYY' },
  jobTitle: { type: String, default: 'Software Professional' },
  avatar: { type: String, default: '' },
  notificationPreferences: {
    upcomingBills: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true },
    salaryAlerts: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
