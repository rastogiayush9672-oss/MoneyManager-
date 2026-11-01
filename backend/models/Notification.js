const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['bill', 'budget', 'salary', 'goal', 'alert', 'insight', 'system'], 
    default: 'alert' 
  },
  read: { type: Boolean, default: false, index: true },
  link: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Notification', NotificationSchema);
