const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AssetLiability = require('../models/AssetLiability');
const financeEngine = require('../services/financeEngine');

// 1. Get Net Worth Summary and Breakdown
router.get('/', auth, async (req, res) => {
  try {
    const data = await financeEngine.getNetWorth(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to retrieve net worth' });
  }
});

// 2. Add Asset or Liability
router.post('/', auth, async (req, res) => {
  try {
    const { type, category, name, value, institution, interestRate, notes } = req.body;

    const item = new AssetLiability({
      user: req.user.id,
      type,
      category,
      name,
      value: Number(value),
      institution: institution || '',
      interestRate: Number(interestRate) || 0,
      notes: notes || ''
    });

    const saved = await item.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create asset/liability record' });
  }
});

// 3. Update Record
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await AssetLiability.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Record not found' });
    if (item.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const updated = await AssetLiability.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, lastUpdated: new Date() } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update record' });
  }
});

// 4. Delete Record
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await AssetLiability.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Record not found' });
    if (item.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await AssetLiability.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Record removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete record' });
  }
});

module.exports = router;
