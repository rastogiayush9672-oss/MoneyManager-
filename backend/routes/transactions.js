const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Get all transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    const newTransaction = new Transaction({
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      user: req.user.id
    });

    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    transaction = await Transaction.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(transaction);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
