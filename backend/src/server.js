const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const setupChatSocket = require('./sockets/chatSocket');
const { seedDefaultRooms } = require('./routes/roomRoutes');

const app = express();
const server = http.createServer(app);

// Allow multiple frontend origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true
  })
);

app.use(express.json());

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup Socket Handlers
setupChatSocket(io);

// Root status page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>PulseChat Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1120; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 32px 40px; border-radius: 16px; border: 1px solid #334155; text-align: center; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 13px; margin-bottom: 16px; }
          h1 { margin: 0 0 8px 0; font-size: 24px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0; }
          .endpoints { text-align: left; background: #0f172a; padding: 14px 18px; border-radius: 8px; font-family: monospace; font-size: 13px; }
          .endpoints div { margin: 6px 0; color: #38bdf8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">🟢 Backend Live & Healthy</div>
          <h1>⚡ PulseChat API Server</h1>
          <p>Real-time chat server powered by Express, Socket.io, and MongoDB Atlas.</p>
          <div class="endpoints">
            <div>GET /api/health → Server Health</div>
            <div>GET /api/rooms → Chat Rooms</div>
            <div>POST /api/auth/login → User Login</div>
            <div>POST /api/auth/guest → Instant Guest</div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'real-time-chat-backend',
    timestamp: new Date().toISOString()
  });
});

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
connectDB().then(async () => {
  await seedDefaultRooms();
  server.listen(PORT, () => {
    console.log(`[Server] Real-time Chat backend listening on port ${PORT}`);
  });
});
