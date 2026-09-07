import React, { useState, useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from './services/socket';
import { api } from './services/api';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import ChatRoom from './components/ChatRoom';
import OnlineUsersList from './components/OnlineUsersList';
import CreateRoomModal from './components/CreateRoomModal';
import './styles/App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOnlineUsersOpen, setIsOnlineUsersOpen] = useState(true);

  const socketRef = useRef(null);
  const currentRoomRef = useRef(currentRoom);

  // Keep ref up to date for socket callbacks
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Load rooms when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const fetchRooms = async () => {
      try {
        const res = await api.getRooms();
        if (res.success && res.rooms?.length > 0) {
          setRooms(res.rooms);
          if (!currentRoomRef.current) {
            setCurrentRoom(res.rooms[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load rooms:', err);
      }
    };

    fetchRooms();
  }, [currentUser]);

  // Connect socket and register listeners
  useEffect(() => {
    if (!currentUser) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    socket.on('roomHistory', ({ room, messages: history }) => {
      if (currentRoomRef.current && currentRoomRef.current.name === room) {
        setMessages(history || []);
      }
    });

    socket.on('chatMessage', (newMsg) => {
      if (currentRoomRef.current && currentRoomRef.current.name === newMsg.room) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    socket.on('typing', ({ room, username, isTyping }) => {
      if (currentRoomRef.current && currentRoomRef.current.name === room) {
        setTypingUsers((prev) => {
          if (isTyping) {
            if (!prev.includes(username)) return [...prev, username];
            return prev;
          } else {
            return prev.filter((u) => u !== username);
          }
        });
      }
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users || []);
    });

    socket.on('userJoined', ({ username, room }) => {
      if (currentRoomRef.current && currentRoomRef.current.name === room) {
        setMessages((prev) => [
          ...prev,
          {
            _id: `sys-join-${Date.now()}-${Math.random()}`,
            type: 'system',
            text: `${username} joined the chat.`,
            createdAt: new Date()
          }
        ]);
      }
    });

    socket.on('userLeft', ({ username, room }) => {
      if (currentRoomRef.current && currentRoomRef.current.name === room) {
        setMessages((prev) => [
          ...prev,
          {
            _id: `sys-leave-${Date.now()}-${Math.random()}`,
            type: 'system',
            text: `${username} left the chat.`,
            createdAt: new Date()
          }
        ]);
      }
    });

    return () => {
      socket.off('roomHistory');
      socket.off('chatMessage');
      socket.off('typing');
      socket.off('onlineUsers');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [currentUser]);

  // Switch or join room on socket
  useEffect(() => {
    if (!currentUser || !currentRoom || !socketRef.current) return;

    setMessages([]);
    setTypingUsers([]);

    socketRef.current.emit('joinRoom', {
      room: currentRoom.name,
      user: currentUser
    });
  }, [currentRoom, currentUser]);

  const handleSendMessage = (text) => {
    if (!socketRef.current || !currentRoom || !currentUser) return;

    socketRef.current.emit('chatMessage', {
      room: currentRoom.name,
      sender: {
        username: currentUser.username,
        avatarColor: currentUser.avatarColor,
        isGuest: currentUser.isGuest
      },
      text
    });
  };

  const handleTyping = (isTyping) => {
    if (!socketRef.current || !currentRoom || !currentUser) return;

    socketRef.current.emit('typing', {
      room: currentRoom.name,
      username: currentUser.username,
      isTyping
    });
  };

  const handleSelectRoom = (room) => {
    if (currentRoom?.name === room.name) return;
    setCurrentRoom(room);
  };

  const handleRoomCreated = (newRoom) => {
    setRooms((prev) => [...prev, newRoom]);
    setCurrentRoom(newRoom);
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
    disconnectSocket();
    setCurrentUser(null);
    setRooms([]);
    setCurrentRoom(null);
    setMessages([]);
    setOnlineUsers([]);
  };

  if (!currentUser) {
    return <AuthModal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-container">
      {/* Mobile Backdrop */}
      <div
        className={`mobile-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Left Sidebar */}
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onSelectRoom={handleSelectRoom}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="main-chat-container">
        <div className="chat-wrapper">
          <ChatRoom
            room={currentRoom}
            messages={messages}
            currentUser={currentUser}
            typingUsers={typingUsers}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isOnlineUsersOpen={isOnlineUsersOpen}
            onToggleOnlineUsers={() => setIsOnlineUsersOpen(!isOnlineUsersOpen)}
            onlineCount={onlineUsers.length}
          />

          {/* Collapsible Right Panel for Online Users */}
          <OnlineUsersList
            users={onlineUsers}
            isOpen={isOnlineUsersOpen}
            onClose={() => setIsOnlineUsersOpen(false)}
            currentUsername={currentUser.username}
          />
        </div>
      </main>

      {/* Create Room Modal */}
      {isCreateRoomOpen && (
        <CreateRoomModal
          currentUser={currentUser}
          onClose={() => setIsCreateRoomOpen(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}
