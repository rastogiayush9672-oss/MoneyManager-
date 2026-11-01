const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const ChatMessage = require('../models/ChatMessage');

// 1. Send Message to AI Finance Assistant
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ msg: 'Message is required' });
    }

    const result = await aiService.processUserMessage(req.user.id, message.trim());
    res.json(result);
  } catch (err) {
    console.error('Error processing AI chat message:', err);
    res.status(500).json({ 
      msg: 'Failed to process AI question', 
      error: err.message,
      fallback: 'An error occurred while evaluating your finances. Please verify your query.' 
    });
  }
});

// 2. Get Chat History
router.get('/history', auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to load conversation history' });
  }
});

// 3. Clear Chat History
router.delete('/history', auth, async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user.id });
    res.json({ msg: 'Conversation history cleared' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to clear chat history' });
  }
});

// 4. Quick Suggestions
router.get('/suggestions', auth, (req, res) => {
  res.json([
    'How much did I spend this month?',
    'What was my highest single expense?',
    'Show my salary history',
    'Compare this month expenses with last month',
    'Which category is exceeding its budget?',
    'Can I afford a purchase of ₹25,000?',
    'What is my current savings rate?',
    'Show my cash flow summary',
    'How are my financial savings goals progressing?',
    'What bills are due in the next 7 days?'
  ]);
});

module.exports = router;
