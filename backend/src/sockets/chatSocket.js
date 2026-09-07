const Message = require('../models/Message');

// In-memory tracking of active sockets: socketId -> { user, room }
const activeSockets = new Map();

// Helper to get online users in a specific room
const getOnlineUsersInRoom = (roomName) => {
  const usersInRoom = [];
  const seenUsernames = new Set();

  for (const [socketId, data] of activeSockets.entries()) {
    if (data.room === roomName && data.user && !seenUsernames.has(data.user.username)) {
      seenUsernames.add(data.user.username);
      usersInRoom.push({
        socketId,
        username: data.user.username,
        avatarColor: data.user.avatarColor || '#4F46E5',
        isGuest: data.user.isGuest || false
      });
    }
  }
  return usersInRoom;
};

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Handle joinRoom
    socket.on('joinRoom', async ({ room, user }) => {
      try {
        if (!room || !user || !user.username) {
          return;
        }

        const cleanRoom = room.toLowerCase().trim();

        // Leave previous room if any
        const previousData = activeSockets.get(socket.id);
        if (previousData && previousData.room) {
          const oldRoom = previousData.room;
          socket.leave(oldRoom);
          activeSockets.delete(socket.id);

          // Notify old room of updated user list
          io.to(oldRoom).emit('onlineUsers', getOnlineUsersInRoom(oldRoom));
        }

        // Join new room
        socket.join(cleanRoom);
        activeSockets.set(socket.id, {
          room: cleanRoom,
          user: {
            username: user.username,
            avatarColor: user.avatarColor || '#4F46E5',
            isGuest: !!user.isGuest
          }
        });

        console.log(`[Socket] ${user.username} joined room #${cleanRoom}`);

        // Broadcast updated online users to everyone in the room
        const onlineUsers = getOnlineUsersInRoom(cleanRoom);
        io.to(cleanRoom).emit('onlineUsers', onlineUsers);

        // Fetch recent chat history from MongoDB
        const history = await Message.find({ room: cleanRoom })
          .sort({ createdAt: 1 })
          .limit(100);

        // Send history back to the joining user
        socket.emit('roomHistory', {
          room: cleanRoom,
          messages: history
        });

        // Broadcast a subtle system join notification to other users in room
        socket.to(cleanRoom).emit('userJoined', {
          username: user.username,
          room: cleanRoom,
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`[Socket Error] joinRoom error:`, error);
      }
    });

    // Handle chatMessage
    socket.on('chatMessage', async ({ room, sender, text }) => {
      try {
        if (!room || !sender || !text || !text.trim()) {
          return;
        }

        const cleanRoom = room.toLowerCase().trim();

        // Save message to MongoDB
        const newMessage = await Message.create({
          room: cleanRoom,
          sender: {
            username: sender.username,
            avatarColor: sender.avatarColor || '#4F46E5',
            isGuest: !!sender.isGuest
          },
          text: text.trim(),
          type: 'chat'
        });

        // Broadcast message to everyone in the room (including sender)
        io.to(cleanRoom).emit('chatMessage', newMessage);
      } catch (error) {
        console.error(`[Socket Error] chatMessage error:`, error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing event
    socket.on('typing', ({ room, username, isTyping }) => {
      if (!room || !username) return;
      const cleanRoom = room.toLowerCase().trim();
      // Broadcast typing indicator to everyone in the room except the typing user
      socket.to(cleanRoom).emit('typing', {
        room: cleanRoom,
        username,
        isTyping
      });
    });

    // Handle leaving room explicitly
    socket.on('leaveRoom', ({ room }) => {
      if (!room) return;
      const cleanRoom = room.toLowerCase().trim();
      socket.leave(cleanRoom);
      const data = activeSockets.get(socket.id);
      if (data && data.room === cleanRoom) {
        activeSockets.delete(socket.id);
        io.to(cleanRoom).emit('onlineUsers', getOnlineUsersInRoom(cleanRoom));
        socket.to(cleanRoom).emit('userLeft', {
          username: data.user.username,
          room: cleanRoom
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const data = activeSockets.get(socket.id);
      if (data) {
        const { room, user } = data;
        activeSockets.delete(socket.id);
        console.log(`[Socket] ${user.username} disconnected from room #${room}`);

        // Update online users in room
        io.to(room).emit('onlineUsers', getOnlineUsersInRoom(room));
        socket.to(room).emit('userLeft', {
          username: user.username,
          room
        });
      } else {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
      }
    });
  });
};

module.exports = setupChatSocket;
