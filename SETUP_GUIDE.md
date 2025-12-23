# 🚀 Quick Setup Guide

Follow these steps to get the chat application running on your machine.

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string

## Step 3: Setup Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_jwt_key_12345
PORT=5000
```

**Replace:**
- `USERNAME` with your MongoDB username
- `PASSWORD` with your MongoDB password
- `cluster` with your cluster name

## Step 4: Start the Servers

### Terminal 1 - Backend
```bash
cd backend
npm start
```

Wait for:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Open browser at: **http://localhost:5173**

## Step 5: Test the Application

1. **Create Account 1**
   - Go to signup page
   - Create user: `alice@example.com` / `password123`

2. **Create Account 2**
   - Logout (or use incognito window)
   - Create user: `bob@example.com` / `password123`

3. **Send Friend Request**
   - Login as Alice
   - Find Bob in user list
   - Click "Add Friend"

4. **Accept Friend Request**
   - Login as Bob
   - See Alice with "Request Received" status
   - Click "Accept"

5. **Start Chatting**
   - Click "Chat" button
   - Send messages back and forth
   - Open both accounts in different browsers to see real-time updates

## 🎉 Done!

Your chat application is now fully functional.

## Common Issues

**MongoDB Connection Failed**
- Check username/password in connection string
- Whitelist your IP in MongoDB Atlas (Network Access)
- Use `0.0.0.0/0` to allow all IPs (for testing only)

**Port Already in Use**
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.js`

**Socket.io Not Connecting**
- Ensure backend is running first
- Check browser console for errors
- Verify token is being sent

## Need Help?

Check the main README.md for detailed documentation.
