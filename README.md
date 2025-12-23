# 💬 Friend-Based Chat Application

A complete, production-ready real-time chat application where users can only message each other after accepting friend requests.

## 🎯 Features

- **Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- **Friend System**: Send, accept, or reject friend requests
- **Real-Time Chat**: Socket.io powered instant messaging between friends
- **User Management**: Browse all users with clear friend status indicators
- **Message Persistence**: All messages saved to MongoDB
- **Protected Routes**: Frontend and backend route protection
- **Clean UI**: Modern, responsive design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Socket.io Client

### Backend
- Node.js
- Express.js
- Socket.io
- JWT Authentication
- bcrypt
- Mongoose

### Database
- MongoDB Atlas

## 📁 Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── FriendRequest.js      # Friend request schema
│   │   ├── Conversation.js       # Conversation schema
│   │   └── Message.js            # Message schema
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Auth routes (signup, login)
│   │   ├── users.js              # User listing with friend status
│   │   ├── friends.js            # Friend request management
│   │   ├── conversations.js      # Conversation routes
│   │   └── messages.js           # Message routes
│   ├── server.js                 # Main server file with Socket.io
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation bar
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Authentication context
    │   │   └── SocketContext.jsx # Socket.io context
    │   ├── pages/
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Signup.jsx        # Signup page
    │   │   ├── Home.jsx          # User list with friend requests
    │   │   └── Chat.jsx          # Chat interface
    │   ├── utils/
    │   │   └── api.js            # Axios instance with interceptors
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # Entry point
    │   ├── config.js             # API and Socket URLs
    │   └── index.css             # Tailwind styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `backend/.env` and add your MongoDB Atlas URI:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

⚠️ **Important**: Replace `MONGODB_URI` with your actual MongoDB Atlas connection string.

### 3. Start Backend Server

```bash
# From backend directory
npm start

# Or for development with auto-reload
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

### 4. Setup Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 5. Start Frontend

```bash
# From frontend directory
npm run dev
```

The app will open at: **http://localhost:5173**

## 📖 How to Use

### 1. Create Accounts
- Navigate to http://localhost:5173/signup
- Create multiple user accounts (use different emails)

### 2. Send Friend Requests
- After login, you'll see all users
- Click "Add Friend" to send a request
- Status indicators show:
  - **Not Friends**: Can send request
  - **Request Sent**: Waiting for acceptance
  - **Request Received**: Can accept/reject
  - **Friends**: Can chat

### 3. Accept Friend Requests
- Login with the other user account
- You'll see "Request Received" status
- Click "Accept" to become friends
- A conversation is automatically created

### 4. Start Chatting
- Click "Chat" button on a friend's card
- Send real-time messages
- Messages are saved and persist on page reload
- See typing indicators
- View timestamps

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for authentication (7-day expiry)
- Protected API routes with auth middleware
- Socket.io authentication
- Friendship verification before allowing chat access
- CORS properly configured

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Clean, modern interface
- Color-coded status badges
- Typing indicators
- Auto-scroll to latest message
- Smooth animations and transitions
- User avatars with initials
- Online/offline status indicators

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users with friend status (protected)

### Friends
- `POST /api/friends/request` - Send friend request (protected)
- `POST /api/friends/accept/:requestId` - Accept request (protected)
- `POST /api/friends/reject/:requestId` - Reject request (protected)

### Conversations
- `GET /api/conversations` - Get user's conversations (protected)
- `GET /api/conversations/with/:userId` - Get conversation with specific user (protected)

### Messages
- `GET /api/messages/:conversationId` - Get messages (protected)
- `POST /api/messages` - Send message (protected, but primarily using Socket.io)

## 🔌 Socket.io Events

### Client → Server
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a message
- `typing` - Notify typing
- `stop_typing` - Stop typing notification

### Server → Client
- `new_message` - Receive new message
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `error` - Error notification

## 🗄️ Database Schema

### User
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  passwordHash: String (required),
  friends: [ObjectId] (references User)
}
```

### FriendRequest
```javascript
{
  from: ObjectId (required, references User),
  to: ObjectId (required, references User),
  status: String (pending/accepted/rejected)
}
```

### Conversation
```javascript
{
  members: [ObjectId] (exactly 2, references User)
}
```

### Message
```javascript
{
  conversationId: ObjectId (required, references Conversation),
  sender: ObjectId (required, references User),
  text: String (required),
  createdAt: Date
}
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB URI is correct
- Ensure MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for testing)
- Verify all environment variables are set

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `frontend/src/config.js` has correct URLs
- Verify CORS is enabled in backend

### Socket.io not connecting
- Check JWT token is valid
- Ensure backend Socket.io server is running
- Check browser console for connection errors

### Messages not sending
- Verify users are friends in database
- Check Socket.io connection status
- Ensure conversation exists

## 📝 Notes

- This is a local development setup
- For production, add:
  - Environment-specific configs
  - Rate limiting
  - Input sanitization
  - Error logging service
  - HTTPS
  - CDN for static assets
  - Database indexing optimization

## 🎉 You're All Set!

The application is now ready to use. Create multiple accounts, add friends, and start chatting!

For any issues, check the console logs in both backend terminal and browser developer tools.
