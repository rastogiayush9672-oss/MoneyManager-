const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const financeEngine = require('../services/financeEngine');

// 1. Get notifications with automated sync
router.get('/', auth, async (req, res) => {
  try {
    // Generate automated alerts if any (upcoming bills, budget warnings)
    const [recurring, budgetStatus] = await Promise.all([
      financeEngine.getRecurringPayments(req.user.id),
      financeEngine.getBudgetStatus(req.user.id)
    ]);

    // Check upcoming bills
    for (const bill of recurring.dueSoon) {
      const exists = await Notification.findOne({
        user: req.user.id,
        type: 'bill',
        title: { $regex: bill.name, $options: 'i' },
        createdAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      });
      if (!exists) {
        await Notification.create({
          user: req.user.id,
          title: `Upcoming Payment: ${bill.name}`,
          message: `₹${bill.amount.toLocaleString('en-IN')} is due in ${bill.daysUntilDue} day(s).`,
          type: 'bill',
          link: '/subscriptions'
        });
      }
    }

    // Check budget warnings
    for (const b of budgetStatus.exceededCategories) {
      const exists = await Notification.findOne({
        user: req.user.id,
        type: 'budget',
        title: { $regex: b.category, $options: 'i' },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      if (!exists) {
        await Notification.create({
          user: req.user.id,
          title: `Budget Limit Exceeded: ${b.category}`,
          message: `You have spent ₹${b.spent.toLocaleString('en-IN')} against your ₹${b.limit.toLocaleString('en-IN')} limit (${b.utilization}%).`,
          type: 'budget',
          link: '/budgets'
        });
      }
    }

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

    res.json({
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to retrieve notifications' });
  }
});

// 2. Mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    if (notification.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// 3. Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// 4. Delete single notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    if (notification.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// 5. Clear all notifications
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ msg: 'Notifications cleared' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
