const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Salary = require('../models/Salary');
const Transaction = require('../models/Transaction');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'slips');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Helper to compute salary totals
function computeSalary(data) {
  const basic = Number(data.basicSalary) || 0;
  const hra = Number(data.hra) || 0;
  const da = Number(data.da) || 0;
  const specialAllowance = Number(data.specialAllowance) || 0;
  const bonuses = Number(data.bonuses) || 0;
  const incentives = Number(data.incentives) || 0;

  const grossSalary = basic + hra + da + specialAllowance + bonuses + incentives;

  const pfDeduction = Number(data.pfDeduction) || 0;
  const taxDeduction = Number(data.taxDeduction) || 0;
  const professionalTax = Number(data.professionalTax) || 200;
  const otherDeductions = Number(data.otherDeductions) || 0;

  const totalDeductions = pfDeduction + taxDeduction + professionalTax + otherDeductions;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    basicSalary: basic,
    hra,
    da,
    specialAllowance,
    bonuses,
    incentives,
    grossSalary,
    pfDeduction,
    taxDeduction,
    professionalTax,
    otherDeductions,
    totalDeductions,
    netSalary
  };
}

// 1. Get all salary records
router.get('/', auth, async (req, res) => {
  try {
    const salaries = await Salary.find({ user: req.user.id }).sort({ year: -1, month: -1 });
    res.json(salaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error retrieving salary records' });
  }
});

// 2. Get salary summary and analytics
router.get('/summary', auth, async (req, res) => {
  try {
    const salaries = await Salary.find({ user: req.user.id }).sort({ year: -1, month: -1 });
    const totalReceived = salaries.reduce((acc, s) => acc + s.netSalary, 0);
    const totalGross = salaries.reduce((acc, s) => acc + s.grossSalary, 0);
    const totalDeductions = salaries.reduce((acc, s) => acc + s.totalDeductions, 0);
    const totalPf = salaries.reduce((acc, s) => acc + s.pfDeduction, 0);
    const totalTax = salaries.reduce((acc, s) => acc + s.taxDeduction, 0);

    const averageNet = salaries.length > 0 ? Math.round(totalReceived / salaries.length) : 0;
    const latest = salaries[0] || null;

    res.json({
      totalRecords: salaries.length,
      latestSalary: latest,
      averageNetSalary: averageNet,
      totalReceived,
      totalGross,
      totalDeductions,
      totalPf,
      totalTax,
      records: salaries
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error computing salary summary' });
  }
});

// 3. Add new salary record
router.post('/', auth, async (req, res) => {
  try {
    const {
      employer,
      designation,
      paymentDate,
      month,
      year,
      paymentMethod,
      notes,
      slipAttachment,
      alsoCreateTransaction = true
    } = req.body;

    const computed = computeSalary(req.body);

    const salary = new Salary({
      user: req.user.id,
      employer: employer || 'Current Employer',
      designation: designation || 'Employee',
      paymentDate: paymentDate || new Date(),
      month: Number(month) || new Date().getMonth() + 1,
      year: Number(year) || new Date().getFullYear(),
      paymentMethod: paymentMethod || 'Direct Bank Transfer',
      notes: notes || '',
      slipAttachment: slipAttachment || '',
      ...computed
    });

    const savedSalary = await salary.save();

    // Optionally create a corresponding income transaction if requested
    if (alsoCreateTransaction && computed.netSalary > 0) {
      await Transaction.create({
        user: req.user.id,
        title: `Salary - ${employer || 'Employer'} (${month}/${year})`,
        amount: computed.netSalary,
        type: 'income',
        category: 'Salary',
        paymentMethod: 'Bank Transfer',
        notes: `Basic: ₹${computed.basicSalary}, Net: ₹${computed.netSalary}`,
        date: paymentDate || new Date()
      });
    }

    res.json(savedSalary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to record salary' });
  }
});

// 4. Update salary record
router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await Salary.findById(req.params.id);
    if (!existing) return res.status(404).json({ msg: 'Salary record not found' });
    if (existing.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const computed = computeSalary({ ...existing.toObject(), ...req.body });

    const updated = await Salary.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, ...computed } },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update salary' });
  }
});

// 5. Delete salary record
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await Salary.findById(req.params.id);
    if (!existing) return res.status(404).json({ msg: 'Salary record not found' });
    if (existing.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Salary.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Salary record deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete salary' });
  }
});

// 6. Upload salary slip file
router.post('/upload-slip', auth, upload.single('slip'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const fileUrl = `/uploads/slips/${req.file.filename}`;
    res.json({ fileUrl, originalName: req.file.originalname });
  } catch (err) {
    res.status(500).json({ msg: 'Error uploading file' });
  }
});

module.exports = router;
