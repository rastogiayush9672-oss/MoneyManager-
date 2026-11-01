const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const financeEngine = require('../services/financeEngine');

// 1. Get budget status with live utilization
router.get('/status', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const status = await financeEngine.getBudgetStatus(req.user.id, month, year);
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to retrieve budget status' });
  }
});

// 2. Get all raw budgets for user
router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user.id };
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const budgets = await Budget.find(query).sort({ category: 1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ msg: 'Server error retrieving budgets' });
  }
});

// 3. Create or update budget for a category
router.post('/', auth, async (req, res) => {
  try {
    const { category, limit, period = 'monthly', month, year, alertThreshold = 80 } = req.body;
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const existing = await Budget.findOne({
      user: req.user.id,
      category: category.trim(),
      month: targetMonth,
      year: targetYear
    });

    if (existing) {
      existing.limit = Number(limit);
      existing.alertThreshold = Number(alertThreshold);
      existing.period = period;
      await existing.save();
      return res.json(existing);
    }

    const budget = new Budget({
      user: req.user.id,
      category: category.trim(),
      limit: Number(limit),
      period,
      month: targetMonth,
      year: targetYear,
      alertThreshold: Number(alertThreshold)
    });

    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to save budget' });
  }
});

// 4. Update budget
router.put('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ msg: 'Budget not found' });
    if (budget.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const updated = await Budget.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update budget' });
  }
});

// 5. Delete budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ msg: 'Budget not found' });
    if (budget.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Budget removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete budget' });
  }
});

module.exports = router;
