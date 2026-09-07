import React from 'react';
import '../styles/OnlineUsers.css';

export default function OnlineUsersList({ users = [], isOpen, onClose, currentUsername }) {
  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="online-users-panel">
      <div className="online-header">
        <div className="online-title">
          <span>In Channel</span>
          <span className="count-pill">{users.length}</span>
        </div>
        <button
          type="button"
          className="btn-close-panel"
          onClick={onClose}
          title="Hide online users"
        >
          ✕
        </button>
      </div>

      <div className="online-list">
        {users.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
            No members online
          </div>
        ) : (
          users.map((user) => {
            const isMe = user.username === currentUsername;
            return (
              <div key={user.socketId || user.username} className="online-user-item">
                <div
                  className="online-user-avatar"
                  style={{ backgroundColor: user.avatarColor || '#4F46E5' }}
                >
                  {getInitials(user.username)}
                  <span className="online-dot" />
                </div>
                <div className="online-user-info">
                  <div className="online-user-name">
                    {user.username} {isMe && '(You)'}
                  </div>
                  <div className="online-user-status">
                    <span>🟢 online</span>
                    {user.isGuest && <span className="guest-pill">Guest</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
