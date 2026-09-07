import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// Android emulator connects to host machine via 10.0.2.2
// If running on a physical phone, replace with your PC local LAN IP (e.g. http://192.168.1.5:5000)
export const DEFAULT_SERVER_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

let socket = null;

export const initSocket = (serverUrl = DEFAULT_SERVER_URL) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('[Mobile Socket] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Mobile Socket] Disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
