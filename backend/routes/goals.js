const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');
const financeEngine = require('../services/financeEngine');

// 1. Get all goals with progress calculations
router.get('/', auth, async (req, res) => {
  try {
    const goalsData = await financeEngine.getFinancialGoals(req.user.id);
    res.json(goalsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to retrieve goals' });
  }
});

// 2. Add new goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount = 0, targetDate, monthlyContribution, category } = req.body;

    const goal = new Goal({
      user: req.user.id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: new Date(targetDate),
      monthlyContribution: Number(monthlyContribution) || 0,
      category: category || 'Personal Savings',
      isCompleted: (Number(currentAmount) || 0) >= Number(targetAmount),
      history: currentAmount > 0 ? [{ amount: Number(currentAmount), date: new Date(), note: 'Initial deposit' }] : []
    });

    const saved = await goal.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create goal' });
  }
});

// 3. Contribute funds to goal
router.post('/:id/contribute', auth, async (req, res) => {
  try {
    const { amount, note = 'Savings deposit' } = req.body;
    const addAmt = Number(amount);
    if (!addAmt || addAmt <= 0) return res.status(400).json({ msg: 'Invalid contribution amount' });

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    goal.currentAmount += addAmt;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    goal.history.push({
      amount: addAmt,
      date: new Date(),
      note
    });

    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to record contribution' });
  }
});

// 4. Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const updated = await Goal.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update goal' });
  }
});

// 5. Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Goal removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete goal' });
  }
});

module.exports = router;
