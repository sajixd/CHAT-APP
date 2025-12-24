const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

const router = express.Router();

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all conversations where user is a member
    const conversations = await Conversation.find({
      members: userId
    });

    const conversationIds = conversations.map(c => c._id);

    // Count unread messages in those conversations sent by OTHER users
    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      sender: { $ne: userId },
      read: false
    });

    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all unread messages for this user
    const unreadMessages = await Message.find({
      sender: { $ne: userId }, // Not sent by me
      read: false
    })
      .populate('sender', 'username profileEmoji') // Get sender details
      .sort({ createdAt: -1 }); // Newest first

    // Group by conversation/sender
    // We only want to show "User X sent you 5 messages", not 5 notifications
    const notificationsMap = new Map();

    // Iterate efficiently
    // We need to fetch conversation to verify membership? 
    // Optimization: Assume message existence implies valid conversation for now, 
    // or we could populate conversation, but that's expensive.

    // Let's filter by conversations user is actually in (extra safety)
    const userConversations = await Conversation.find({ members: userId }).select('_id');
    const userConvIds = userConversations.map(c => c._id.toString());

    for (const msg of unreadMessages) {
      if (!userConvIds.includes(msg.conversationId.toString())) continue;

      const senderId = msg.sender._id.toString();
      const existing = notificationsMap.get(senderId);

      if (existing) {
        existing.count++;
      } else {
        notificationsMap.set(senderId, {
          sender: msg.sender,
          count: 1,
          latestMessage: msg.text,
          timestamp: msg.createdAt,
          conversationId: msg.conversationId
        });
      }
    }

    const notifications = Array.from(notificationsMap.values());
    res.json(notifications);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Mark messages as read
router.put('/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Verify user is member of conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.members.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update all messages in this conversation where sender is NOT the current user
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
