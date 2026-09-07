# ⚡ PulseChat - Real-Time Chat Website & Mobile App

A modern, production-grade real-time chat application built with **Node.js, Express, React.js, Socket.io, and MongoDB**. Includes an optional companion **React Native CLI (Android)** mobile client.

---

## 🧰 Tech Stack & Compliance

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Node.js + Express | REST APIs, User Auth, Room APIs, CORS, Dotenv |
| **Real-Time Communication** | Socket.io (`v4`) | WebSocket duplex broadcasting, rooms, typing, online presence |
| **Database** | MongoDB (Mongoose `v8`) | Message history, User profiles, Room channels |
| **Frontend Web** | React.js (`v18`) | Single Page App, pure custom CSS (**Zero Next.js, Zero Tailwind CSS**) |
| **Mobile App (Optional)** | React Native CLI | Native Android chat UI with WhatsApp-style group chat layout |

> [!NOTE]
> **Strict Constraint Compliance**: This project strictly uses **Standard React.js** and **Custom Modern CSS** with design tokens/variables. Neither **Next.js** nor **Tailwind CSS** is used.

---

## ✨ Features Implemented

### 👥 1. User Authentication & Guest Access
- **Instant Guest Mode**: Choose any username and start chatting immediately without passwords.
- **Account Registration & Login**: Secure password hashing with `bcryptjs` and session persistence via JWT tokens stored in `localStorage`.
- **Custom Avatars**: Auto-generated distinctive avatar color badges for every user.

### 💬 2. Real-Time Chat Messaging
- Real-time bidirectional messaging powered by Socket.io room broadcasting.
- Messages display sender's username, avatar initials, and formatted timestamp (`10:45 AM`).
- Distinct visual styling: Self messages (right-aligned, indigo bubble) vs. Other members' messages (left-aligned, slate bubble).
- Input validation: Prevents sending blank or whitespace-only messages.
- Quick emoji reaction shortcuts (`👋`, `🔥`, `🚀`, `❤️`, `👍`, `🎉`, etc.).

### 📁 3. Independent Chat Rooms
- Pre-seeded channels: `#general`, `#tech-talk`, `#random`, `#gaming`.
- **Dynamic Channel Creation**: Modal dialog to create new public channels with customized handles, display titles, and topics.
- Instant room switching with independent message streams and active indicators.

### 🟢 4. Live Online Users
- Real-time tracking of active connections per room.
- Sidebar indicator with live member count pill and green status badges (`🟢 Online`).
- Automatic updates on member join, room switch, or disconnect.

### ⌨️ 5. Typing Indicators
- Animated typing dots and live banner ("*Alice is typing...*").
- Multi-user typing support ("*Alice and Bob are typing...*").
- Debounced automatic clearing after 1.5 seconds of inactivity.

### 🕓 6. Chat History Persistence
- Full MongoDB persistence with indexed `{ room, createdAt }` lookups.
- History loads automatically whenever a user joins or switches channels.
- Smooth auto-scrolling to the latest message.

### 📱 7. Companion Mobile App (React Native CLI)
- Full Android React Native CLI client under `mobile/`.
- WhatsApp group chat layout with header room details, message bubbles, and typing status.
- Configurable server endpoint for Android Emulator (`10.0.2.2:5000`) or physical device.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **MongoDB** running locally on port 27017 (or a MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
- Server starts on `http://localhost:5000`
- Verifies MongoDB connection and automatically seeds default rooms.
- Run automated Socket.io tests:
  ```bash
  npm run test:socket
  ```

### 3. Frontend Web Setup
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.
- Open multiple browser tabs (or incognito windows) to test real-time communication between multiple users!

### 4. Mobile App Setup (Android React Native CLI)
```bash
cd mobile
npm install
npm start
# In a separate terminal:
npm run android
```
*(See [`mobile/README.md`](mobile/README.md) for full Android SDK & APK build steps).*

---

## 🌐 Production Deployment Guide

### A. Deploy Backend (e.g. Render / Railway)
1. Push `backend/` to your GitHub repository.
2. Sign up on [Render.com](https://render.com/) or [Railway.app](https://railway.app/).
3. Create a new **Web Service** pointing to your repository.
4. Set Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`)
   - `JWT_SECRET`: A strong secret string
   - `CLIENT_URL`: Your deployed frontend URL (e.g. `https://your-app.netlify.app`)
5. Deploy. You will receive your live backend URL (e.g. `https://pulsechat-backend.onrender.com`).

### B. Deploy Frontend (Netlify)
1. Push `frontend/` to your GitHub repository.
2. Sign up on [Netlify](https://www.netlify.com/).
3. Create a new site from your Git repository:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Set Environment Variable in Netlify:
   - `VITE_BACKEND_URL`: Your deployed backend URL (e.g. `https://pulsechat-backend.onrender.com`)
5. Deploy. `netlify.toml` is already included to handle SPA client-side routing.

---

## 📤 Submission Checklist

- [x] **Frontend Web URL**: Netlify (or Vercel)
- [x] **Backend API URL**: Render (or Railway / Vercel)
- [x] **GitHub Repositories**: Public repository with clean commit history
- [x] **Optional Mobile App**: Android React Native CLI codebase included in `mobile/`
- [x] **Submission Form**: [Google Form Link](https://forms.gle/FWbyM5awhM6AtY638)
