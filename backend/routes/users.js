const express = require('express');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users with friend status
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.userId;
    
    // Get current user with friends
    const currentUser = await User.findById(currentUserId);
    
    // Get all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } }).select('-passwordHash');
    
    // Get all friend requests involving current user
    const sentRequests = await FriendRequest.find({ 
      from: currentUserId, 
      status: 'pending' 
    });
    
    const receivedRequests = await FriendRequest.find({ 
      to: currentUserId, 
      status: 'pending' 
    });
    
    // Map users with their status
    const usersWithStatus = users.map(user => {
      let status = 'not_friends';
      let requestId = null;
      
      // Check if friends
      if (currentUser.friends.some(friendId => friendId.toString() === user._id.toString())) {
        status = 'friends';
      }
      // Check if request sent
      else {
        const sentReq = sentRequests.find(req => req.to.toString() === user._id.toString());
        if (sentReq) {
          status = 'request_sent';
          requestId = sentReq._id;
        } else {
          // Check if request received
          const receivedReq = receivedRequests.find(req => req.from.toString() === user._id.toString());
          if (receivedReq) {
            status = 'request_received';
            requestId = receivedReq._id;
          }
        }
      }
      
      return {
        id: user._id,
        username: user.username,
        email: user.email,
        status,
        requestId
      };
    });
    
    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
