const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Ensure only 2 members per conversation
conversationSchema.path('members').validate(function(value) {
  return value.length === 2;
}, 'Conversation must have exactly 2 members');

module.exports = mongoose.model('Conversation', conversationSchema);
