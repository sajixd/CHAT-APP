const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all conversations for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    const conversations = await Conversation.find({
      members: userId
    }).populate('members', '-passwordHash');

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ 
          conversationId: conv._id 
        }).sort({ createdAt: -1 });

        // Get the other user
        const otherUser = conv.members.find(
          member => member._id.toString() !== userId
        );

        return {
          id: conv._id,
          otherUser: {
            id: otherUser._id,
            username: otherUser.username,
            email: otherUser.email
          },
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt
          } : null,
          updatedAt: conv.updatedAt
        };
      })
    );

    // Sort by last activity
    conversationsWithLastMessage.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt;
      const bTime = b.lastMessage?.createdAt || b.updatedAt;
      return new Date(bTime) - new Date(aTime);
    });

    res.json(conversationsWithLastMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation with a specific user
router.get('/with/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.userId;
    const otherUserId = req.params.userId;

    // Verify friendship
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.friends.includes(otherUserId)) {
      return res.status(403).json({ error: 'Not friends with this user' });
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      members: { $all: [currentUserId, otherUserId] }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversationId: conversation._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
