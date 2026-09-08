import { io } from 'socket.io-client';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://real-time-chat-website-k7i0.onrender.com');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server, id:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection warning:', error.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
