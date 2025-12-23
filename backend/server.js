require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId}`);

  // Join conversation room
  socket.on('join_conversation', async (conversationId) => {
    try {
      // Verify user is member of conversation
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      if (!conversation.members.includes(socket.userId)) {
        socket.emit('error', { message: 'Not authorized to join this conversation' });
        return;
      }

      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error('Join conversation error:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, text } = data;

      if (!text || !text.trim()) {
        socket.emit('error', { message: 'Message text is required' });
        return;
      }

      // Verify user is member of conversation
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      if (!conversation.members.includes(socket.userId)) {
        socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
        return;
      }

      // Create message
      const message = new Message({
        conversationId,
        sender: socket.userId,
        text: text.trim()
      });

      await message.save();
      await message.populate('sender', 'username');

      // Emit to all users in the conversation room
      io.to(conversationId).emit('new_message', message);

      console.log(`Message sent in conversation ${conversationId}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, username } = data;
    socket.to(conversationId).emit('user_typing', { username });
  });

  socket.on('stop_typing', (conversationId) => {
    socket.to(conversationId).emit('user_stop_typing');
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
