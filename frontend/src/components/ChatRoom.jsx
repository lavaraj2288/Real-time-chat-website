import React, { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import '../styles/ChatRoom.css';

export default function ChatRoom({
  room,
  messages,
  currentUser,
  typingUsers,
  onlineUsers,
  onSendMessage,
  onTyping,
  onBackToChats,
  onOpenGroupInfo
}) {
  const messagesEndRef = useRef(null);

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
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  // Generate subtitle text
  let subtitleText = 'tap for group info';
  const isSomeoneTyping = typingUsers && typingUsers.length > 0;

  if (isSomeoneTyping) {
    subtitleText = `${typingUsers.join(', ')} typing...`;
  } else if (onlineUsers && onlineUsers.length > 0) {
    const names = onlineUsers.map((u) => (u.username === currentUser?.username ? 'You' : u.username));
    subtitleText = `🟢 ${names.join(', ')}`;
  }

  let lastDate = null;

  return (
    <div className="wa-chat-screen">
      {/* WhatsApp Group Header */}
      <header className="wa-group-header">
        <div className="wa-header-left" onClick={onOpenGroupInfo} title="Group info">
          <button
            type="button"
            className="wa-btn-back"
            onClick={(e) => {
              e.stopPropagation();
              if (onBackToChats) onBackToChats();
            }}
            title="Back to chats"
          >
            ‹
          </button>
          <div className="wa-group-avatar">
            {getInitials(room?.displayName || room?.name || 'Group')}
          </div>
          <div className="wa-group-meta">
            <div className="wa-group-title">
              {room?.displayName || room?.name}
            </div>
            <div className={`wa-group-subtitle ${isSomeoneTyping ? 'typing' : ''}`}>
              {subtitleText}
            </div>
          </div>
        </div>

        <div className="wa-header-right">
          <button
            type="button"
            className="wa-header-pill"
            onClick={onOpenGroupInfo}
            title="View online members"
          >
            <span className="wa-online-dot" />
            <span>{onlineUsers?.length || 1} Online</span>
          </button>
        </div>
      </header>

      {/* Messages Feed */}
      <div className="wa-messages-area">
        {messages.length === 0 ? (
          <div className="wa-empty-chat">
            <div className="wa-empty-icon">💬</div>
            <div className="wa-empty-title">Welcome to #{room?.displayName || room?.name}!</div>
            <div className="wa-empty-desc">
              Messages are encrypted & stored in MongoDB. Be the first to send a message to the group!
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSystem = msg.type === 'system' || !msg.sender;
            if (isSystem) {
              return (
                <div key={msg._id || index} className="wa-system-pill">
                  {msg.text}
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
                  <div className="wa-date-divider">
                    <span className="wa-date-pill">{messageDate}</span>
                  </div>
                )}

                <div className={`wa-msg-wrapper ${isSelf ? 'self' : 'other'}`}>
                  <div className="wa-msg-bubble">
                    {!isSelf && (
                      <div
                        className="wa-msg-sender"
                        style={{ color: msg.sender?.avatarColor || '#00a884' }}
                      >
                        <span>{msg.sender?.username}</span>
                        {msg.sender?.isGuest && (
                          <span className="wa-guest-tag">Guest</span>
                        )}
                      </div>
                    )}

                    <div className="wa-msg-text">{msg.text}</div>

                    <div className="wa-msg-footer">
                      <span className="wa-msg-time">
                        {formatTime(msg.createdAt)}
                      </span>
                      {isSelf && <span className="wa-msg-ticks">✓✓</span>}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        placeholder="Type a message..."
      />
    </div>
  );
}
