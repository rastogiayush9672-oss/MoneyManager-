const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const financeEngine = require('../services/financeEngine');

// 1. Get subscriptions summary and enriched list
router.get('/', auth, async (req, res) => {
  try {
    const data = await financeEngine.getRecurringPayments(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to retrieve subscriptions' });
  }
});

// 2. Add subscription
router.post('/', auth, async (req, res) => {
  try {
    const { name, amount, billingCycle, category, nextDueDate, paymentMethod, notes } = req.body;

    const sub = new Subscription({
      user: req.user.id,
      name,
      amount: Number(amount),
      billingCycle: billingCycle || 'monthly',
      category: category || 'Streaming',
      nextDueDate: new Date(nextDueDate),
      paymentMethod: paymentMethod || 'Auto-Debit / Credit Card',
      notes: notes || ''
    });

    const saved = await sub.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create subscription' });
  }
});

// 3. Mark as Paid and advance due date
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ msg: 'Subscription not found' });
    if (sub.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    // Record payment in history
    sub.paymentHistory.push({
      paidDate: new Date(),
      amount: sub.amount,
      status: 'paid'
    });

    // Advance next due date
    const currentDue = new Date(sub.nextDueDate);
    if (sub.billingCycle === 'monthly') {
      currentDue.setMonth(currentDue.getMonth() + 1);
    } else if (sub.billingCycle === 'yearly') {
      currentDue.setFullYear(currentDue.getFullYear() + 1);
    } else if (sub.billingCycle === 'quarterly') {
      currentDue.setMonth(currentDue.getMonth() + 3);
    } else if (sub.billingCycle === 'weekly') {
      currentDue.setDate(currentDue.getDate() + 7);
    }
    sub.nextDueDate = currentDue;
    await sub.save();

    // Also record an expense transaction
    await Transaction.create({
      user: req.user.id,
      title: `${sub.name} (Recurring Payment)`,
      amount: sub.amount,
      type: 'expense',
      category: sub.category === 'Streaming' || sub.category === 'Software' ? 'Entertainment' : 'Utilities',
      paymentMethod: 'Credit Card',
      isEssential: sub.category === 'Utilities' || sub.category === 'Rent' || sub.category === 'Insurance',
      merchant: sub.name,
      notes: `Recurring payment billed on ${new Date().toLocaleDateString()}`,
      recurring: true
    });

    res.json({ msg: 'Payment logged successfully', subscription: sub });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to log payment' });
  }
});

// 4. Update subscription
router.put('/:id', auth, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ msg: 'Subscription not found' });
    if (sub.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const updated = await Subscription.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update subscription' });
  }
});

// 5. Delete subscription
router.delete('/:id', auth, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ msg: 'Subscription not found' });
    if (sub.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Subscription removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete subscription' });
  }
});

module.exports = router;
