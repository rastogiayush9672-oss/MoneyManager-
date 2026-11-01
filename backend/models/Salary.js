const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  employer: { type: String, required: true, trim: true },
  designation: { type: String, default: '', trim: true },
  paymentDate: { type: Date, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  
  // Earnings
  basicSalary: { type: Number, required: true, default: 0 },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  bonuses: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true, default: 0 },

  // Deductions
  pfDeduction: { type: Number, default: 0 },
  taxDeduction: { type: Number, default: 0 }, // TDS
  professionalTax: { type: Number, default: 200 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, required: true, default: 0 },

  // Net Take-Home
  netSalary: { type: Number, required: true, default: 0 },

  paymentMethod: { type: String, default: 'Direct Bank Transfer' },
  slipAttachment: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

SalarySchema.index({ user: 1, year: -1, month: -1 });

module.exports = mongoose.model('Salary', SalarySchema);
