const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  toolsUsed: [{ type: String }],
  dataSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
