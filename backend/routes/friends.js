const express = require('express');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

const router = express.Router();

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = req.userId;

    if (!toUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if target user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    const fromUser = await User.findById(fromUserId);
    if (fromUser.friends.includes(toUserId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: fromUserId, to: toUserId },
        { from: toUserId, to: fromUserId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      from: fromUserId,
      to: toUserId
    });

    await friendRequest.save();

    res.status(201).json({ 
      message: 'Friend request sent successfully',
      requestId: friendRequest._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept friend request
router.post('/accept/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.userId;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify the request is for current user
    if (friendRequest.to.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add to friends list for both users
    await User.findByIdAndUpdate(friendRequest.from, {
      $addToSet: { friends: friendRequest.to }
    });

    await User.findByIdAndUpdate(friendRequest.to, {
      $addToSet: { friends: friendRequest.from }
    });

    // Create conversation
    const conversation = new Conversation({
      members: [friendRequest.from, friendRequest.to]
    });

    await conversation.save();

    res.json({ 
      message: 'Friend request accepted',
      conversationId: conversation._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject friend request
router.post('/reject/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.userId;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify the request is for current user
    if (friendRequest.to.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Update request status
    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
