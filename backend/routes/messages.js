const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Verify user is member of conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.members.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message (REST fallback - mainly using Socket.io)
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Verify user is member of conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.members.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: userId,
      text: text.trim()
    });

    await message.save();
    await message.populate('sender', 'username');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
