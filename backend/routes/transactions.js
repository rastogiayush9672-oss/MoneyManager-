const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const financeEngine = require('../services/financeEngine');

// 1. Get transactions with pagination, filtering, search, and sorting
router.get('/', auth, async (req, res) => {
  try {
    const data = await financeEngine.getTransactionHistory(req.user.id, req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error fetching transactions' });
  }
});

// 2. Add new transaction
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      subCategory,
      paymentMethod,
      isEssential,
      merchant,
      notes,
      date,
      recurring,
      frequency
    } = req.body;

    const newTransaction = new Transaction({
      title: title ? title.trim() : 'Untitled Transaction',
      amount: Number(amount),
      type: type || 'expense',
      category: category || 'Miscellaneous',
      subCategory: subCategory || '',
      paymentMethod: paymentMethod || 'UPI',
      isEssential: isEssential !== undefined ? isEssential : true,
      merchant: merchant || '',
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
      recurring: recurring || false,
      frequency: frequency || 'one-time',
      user: req.user.id
    });

    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to record transaction' });
  }
});

// 3. Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error updating transaction' });
  }
});

// 4. Delete single transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error removing transaction' });
  }
});

// 5. Bulk Delete
router.post('/bulk-delete', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ msg: 'No transaction IDs provided' });
    }

    const result = await Transaction.deleteMany({
      _id: { $in: ids },
      user: req.user.id
    });

    res.json({ msg: `Deleted ${result.deletedCount} transaction(s)`, count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to bulk delete transactions' });
  }
});

// 6. Bulk Categorize
router.post('/bulk-categorize', auth, async (req, res) => {
  try {
    const { ids, category } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !category) {
      return res.status(400).json({ msg: 'IDs and target category required' });
    }

    const result = await Transaction.updateMany(
      { _id: { $in: ids }, user: req.user.id },
      { $set: { category: category.trim() } }
    );

    res.json({ msg: `Updated ${result.modifiedCount} transaction(s) to ${category}`, count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to bulk categorize transactions' });
  }
});

// 7. CSV Import with validation and duplicate prevention
router.post('/import-csv', auth, async (req, res) => {
  try {
    const { records } = req.body; // Array of { title, amount, type, category, date, paymentMethod, merchant }
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ msg: 'No records provided for import' });
    }

    let inserted = 0;
    let skipped = 0;

    for (const r of records) {
      const title = r.title ? String(r.title).trim() : 'CSV Import';
      const amount = Number(r.amount);
      const type = (r.type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
      const category = r.category ? String(r.category).trim() : 'General';
      const date = r.date ? new Date(r.date) : new Date();

      if (isNaN(amount) || amount <= 0) {
        skipped++;
        continue;
      }

      // Duplicate check: Same user, title, amount, type, and date within 24 hours
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const isDuplicate = await Transaction.findOne({
        user: req.user.id,
        title,
        amount,
        type,
        date: { $gte: dayStart, $lte: dayEnd }
      });

      if (isDuplicate) {
        skipped++;
        continue;
      }

      await Transaction.create({
        user: req.user.id,
        title,
        amount,
        type,
        category,
        subCategory: r.subCategory || '',
        paymentMethod: r.paymentMethod || 'UPI',
        merchant: r.merchant || '',
        notes: r.notes || 'Imported via CSV',
        date
      });
      inserted++;
    }

    res.json({
      msg: `Import complete: ${inserted} added, ${skipped} skipped (duplicates/invalid)`,
      inserted,
      skipped
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to import CSV records' });
  }
});

module.exports = router;
