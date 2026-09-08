import React from 'react';
import '../styles/OnlineUsers.css';

export default function OnlineUsersList({ users = [], isOpen, onClose, currentUsername, room }) {
  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="wa-info-overlay" onClick={onClose}>
      <div className="wa-info-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wa-info-header">
          <button
            type="button"
            className="wa-icon-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
          <div className="wa-info-header-title">Group Info</div>
        </div>

        <div className="wa-info-body">
          {/* Hero details */}
          <div className="wa-info-hero">
            <div className="wa-info-avatar">
              {getInitials(room?.displayName || room?.name || 'Group')}
            </div>
            <h2 className="wa-info-title">#{room?.displayName || room?.name}</h2>
            <p className="wa-info-desc">{room?.topic || 'A friendly place to chat'}</p>
          </div>

          {/* Participants list */}
          <div>
            <div className="wa-section-title">
              Participants ({users.length} Online)
            </div>
            <div className="wa-members-list">
              {users.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '10px 0' }}>
                  No members online right now
                </div>
              ) : (
                users.map((user) => {
                  const isMe = user.username === currentUsername;
                  return (
                    <div key={user.socketId || user.username} className="wa-member-row">
                      <div
                        className="wa-member-avatar"
                        style={{ backgroundColor: user.avatarColor || '#4F46E5' }}
                      >
                        {getInitials(user.username)}
                        <span className="wa-member-online-dot" />
                      </div>
                      <div className="wa-member-details">
                        <div className="wa-member-name">
                          <span>{user.username}</span>
                          {isMe && <span className="wa-you-badge">You</span>}
                          {user.isGuest && <span className="wa-guest-tag">Guest</span>}
                        </div>
                        <div className="wa-member-status">
                          <span>🟢 Online</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
