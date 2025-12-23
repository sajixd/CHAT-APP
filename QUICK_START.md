# ⚡ Quick Start (Copy & Paste)

## 1️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MongoDB URI
npm start
```

## 2️⃣ Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

## 3️⃣ Open Browser
Go to: **http://localhost:5173**

---

## What You Need to Change

**Only one file:** `backend/.env`

```env
MONGODB_URI=your_mongodb_atlas_uri_here
JWT_SECRET=any_random_secret_key
PORT=5000
```

---

## File Structure Created

```
📦 Project Root
├── 📁 backend/
│   ├── 📁 config/
│   │   └── db.js
│   ├── 📁 middleware/
│   │   └── auth.js
│   ├── 📁 models/
│   │   ├── User.js
│   │   ├── FriendRequest.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── 📁 routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── friends.js
│   │   ├── conversations.js
│   │   └── messages.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── 📁 frontend/
    ├── 📁 src/
    │   ├── 📁 components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── 📁 context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── 📁 pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Home.jsx
    │   │   └── Chat.jsx
    │   ├── 📁 utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── config.js
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Testing Checklist

✅ **Backend Running**
- MongoDB connected message appears
- Server running on port 5000

✅ **Frontend Running**
- Vite dev server at http://localhost:5173
- No console errors

✅ **Create Users**
- Signup works
- Login works
- JWT token stored

✅ **Friend System**
- Can see user list
- Can send friend request
- Can accept/reject request
- Status updates correctly

✅ **Chat**
- Chat button appears for friends only
- Can send messages
- Messages appear in real-time
- Typing indicator works
- Messages persist on reload

---

## Tech Stack Summary

**Frontend:** React + Vite + Tailwind CSS + Socket.io-client + Axios
**Backend:** Express + Socket.io + JWT + bcrypt + Mongoose
**Database:** MongoDB Atlas

---

## Support

📖 See `README.md` for full documentation
🚀 See `SETUP_GUIDE.md` for detailed setup steps
