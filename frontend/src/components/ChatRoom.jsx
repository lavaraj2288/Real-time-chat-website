import React, { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import '../styles/ChatRoom.css';

export default function ChatRoom({
  room,
  messages,
  currentUser,
  typingUsers,
  onSendMessage,
  onTyping,
  onToggleSidebar,
  isOnlineUsersOpen,
  onToggleOnlineUsers,
  onlineCount
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const formatTime = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  if (!room) {
    return (
      <div className="chat-center" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>Select or create a channel to start chatting</h3>
        </div>
      </div>
    );
  }

  // Group messages by date to render date separators
  let lastDate = null;

  return (
    <div className="chat-center">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <button
            type="button"
            className="btn-mobile-menu"
            onClick={onToggleSidebar}
            title="Open Channels"
          >
            ☰
          </button>
          <div className="header-room-details">
            <div className="header-room-title">
              <span className="prefix">#</span>
              <span>{room.displayName || room.name}</span>
            </div>
            <div className="header-room-topic">
              {room.topic || 'Welcome to the room!'}
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className={`btn-toggle-members ${isOnlineUsersOpen ? 'active' : ''}`}
            onClick={onToggleOnlineUsers}
            title="Toggle Members Panel"
          >
            <span className="online-pill"></span>
            <span>{onlineCount} Online</span>
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
              Welcome to #{room.displayName || room.name}!
            </h3>
            <p style={{ fontSize: 13 }}>
              This is the start of the #{room.name} channel. Be the first to say hi!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSystem = msg.type === 'system' || !msg.sender;
            if (isSystem) {
              return (
                <div key={msg._id || index} className="system-event">
                  <span className="system-event-text">{msg.text}</span>
                </div>
              );
            }

            const isSelf = msg.sender?.username === currentUser?.username;
            const messageDate = formatDate(msg.createdAt);
            let showDateDivider = false;
            if (messageDate && messageDate !== lastDate) {
              showDateDivider = true;
              lastDate = messageDate;
            }

            return (
              <React.Fragment key={msg._id || index}>
                {showDateDivider && (
                  <div className="date-divider">
                    <span className="date-badge">{messageDate}</span>
                  </div>
                )}
                <div className={`message-row ${isSelf ? 'self' : 'other'}`}>
                  {!isSelf && (
                    <div
                      className="message-avatar"
                      style={{ backgroundColor: msg.sender?.avatarColor || '#4F46E5' }}
                    >
                      {getInitials(msg.sender?.username)}
                    </div>
                  )}

                  <div className="message-content">
                    <div className="message-meta">
                      <span className="message-sender">
                        {isSelf ? 'You' : msg.sender?.username}
                      </span>
                      {msg.sender?.isGuest && (
                        <span className="guest-pill">Guest</span>
                      )}
                      <span className="message-time">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    <div className="message-bubble">
                      {msg.text}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Message Input Box */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        placeholder={`Message #${room.displayName || room.name}...`}
      />
    </div>
  );
}
