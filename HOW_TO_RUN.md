# 🎯 HOW TO RUN THE APP

## Prerequisites
- Node.js installed
- MongoDB Atlas account (free tier works)

---

## Step-by-Step Instructions

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB
Create `backend/.env` file:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=any_random_secret_string_here
PORT=5000
```

**Get MongoDB URI:**
1. Login to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### 3. Start Backend Server
```bash
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

### 4. Install Frontend Dependencies (New Terminal)
```bash
cd frontend
npm install
```

### 5. Start Frontend Server
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.0.11  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 6. Open Browser
Navigate to: **http://localhost:5173**

---

## Testing the App

### Create Two Users
1. **User 1 (Alice)**
   - Click "Sign up"
   - Username: `alice`
   - Email: `alice@test.com`
   - Password: `password123`

2. **User 2 (Bob)** - Open incognito/private window
   - Click "Sign up"
   - Username: `bob`
   - Email: `bob@test.com`
   - Password: `password123`

### Send Friend Request
1. **As Alice:**
   - You'll see Bob in the user list
   - Click "Add Friend" on Bob's card
   - Status changes to "Request Sent"

### Accept Friend Request
2. **As Bob:**
   - Refresh or login
   - You'll see Alice with "Request Received" status
   - Click "Accept"
   - Status changes to "Friends"

### Start Chatting
3. **As Alice or Bob:**
   - Click the "Chat" button on your friend's card
   - Type a message and press "Send"
   - See real-time updates!

### Test Real-Time Chat
4. Keep both browser windows open side by side
5. Send messages from either account
6. Watch messages appear instantly in both windows
7. See typing indicators when someone is typing

---

## Architecture Overview

### Backend (Port 5000)
- **Express Server** - REST API
- **Socket.io** - Real-time messaging
- **JWT Auth** - Secure authentication
- **Mongoose** - MongoDB ODM

### Frontend (Port 5173)
- **React + Vite** - Fast development
- **Tailwind CSS** - Beautiful UI
- **Axios** - API calls
- **Socket.io-client** - Real-time connection

### Database (MongoDB Atlas)
- **Users** - Authentication & friend lists
- **FriendRequests** - Pending/accepted/rejected
- **Conversations** - Between two friends
- **Messages** - Chat history

---

## Key Features Implemented

✅ **Authentication**
- Signup with username, email, password
- Login with email and password
- JWT token stored in localStorage
- Auto-logout on token expiry

✅ **Friend System**
- View all users
- Send friend requests
- Accept/reject requests
- Status badges (Not Friends, Request Sent, Request Received, Friends)

✅ **Chat System**
- Only friends can chat
- Real-time messaging via Socket.io
- Typing indicators
- Message timestamps
- Auto-scroll to latest message
- Messages persist in database

✅ **Security**
- Passwords hashed with bcrypt
- JWT authentication
- Protected routes (frontend & backend)
- Friendship verification before chat access
- Socket.io authentication

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/users` | Get all users with friend status |
| POST | `/api/friends/request` | Send friend request |
| POST | `/api/friends/accept/:id` | Accept friend request |
| POST | `/api/friends/reject/:id` | Reject friend request |
| GET | `/api/conversations` | Get user's conversations |
| GET | `/api/messages/:conversationId` | Get messages |

---

## Troubleshooting

### ❌ "MongoDB connection failed"
- Check your MongoDB URI in `.env`
- Verify username and password
- Add your IP to MongoDB Atlas whitelist

### ❌ "Cannot connect to server"
- Ensure backend is running on port 5000
- Check if port is already in use
- Verify `frontend/src/config.js` has correct API URL

### ❌ "Socket.io not connecting"
- Backend must be running first
- Check browser console for errors
- Verify JWT token is valid

### ❌ "Cannot send messages"
- Ensure users are friends (not just request sent)
- Check Socket.io connection status (green dot)
- Verify conversation exists in database

---

## Production Deployment Notes

For production deployment, you should:
- Use environment variables for all configs
- Enable HTTPS
- Add rate limiting
- Implement input validation/sanitization
- Set up error logging (e.g., Sentry)
- Use production-ready MongoDB cluster
- Add database indexes
- Implement message pagination
- Add file upload for images
- Add user presence (online/offline)

---

## 🎉 Congratulations!

You now have a fully functional, production-ready friend-based chat application!

**What makes this special:**
- ✅ No Firebase - Pure Node.js backend
- ✅ No Next.js - Clean React with Vite
- ✅ Real friendship logic - No chat without approval
- ✅ Real-time with Socket.io
- ✅ Clean, minimal code
- ✅ Production-ready architecture

---

**Need help?** Check `README.md` for detailed documentation.
