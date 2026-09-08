import React, { useState } from 'react';

export default function Sidebar({
  rooms,
  currentRoom,
  onSelectRoom,
  currentUser,
  onLogout,
  onOpenCreateRoom
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      (r.displayName && r.displayName.toLowerCase().includes(term)) ||
      (r.topic && r.topic.toLowerCase().includes(term))
    );
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      {/* WhatsApp Sidebar Header */}
      <div className="wa-sidebar-header">
        <div className="wa-profile-info">
          <div
            className="wa-my-avatar"
            style={{ backgroundColor: currentUser?.avatarColor || '#00a884' }}
            title={currentUser?.username}
          >
            {getInitials(currentUser?.username)}
            <span className="wa-status-online" />
          </div>
          <div>
            <div className="wa-my-name">{currentUser?.username}</div>
            <div className="wa-my-tag">
              {currentUser?.isGuest ? 'Guest' : 'Online'}
            </div>
          </div>
        </div>

        <div className="wa-header-actions">
          <button
            type="button"
            className="wa-icon-btn btn-new-group"
            onClick={onOpenCreateRoom}
            title="Create New Group"
          >
            +
          </button>
          <button
            type="button"
            className="wa-icon-btn"
            onClick={onLogout}
            title="Sign out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* WhatsApp Search Bar */}
      <div className="wa-search-container">
        <div className="wa-search-box">
          <span className="wa-search-icon">🔍</span>
          <input
            type="text"
            className="wa-search-input"
            placeholder="Search or start new chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* WhatsApp Chats List */}
      <div className="wa-chats-list">
        {filteredRooms.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No groups found
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isActive = currentRoom && currentRoom.name === room.name;
            return (
              <div
                key={room._id || room.name}
                className={`wa-chat-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="wa-chat-avatar">
                  {getInitials(room.displayName || room.name)}
                </div>
                <div className="wa-chat-body">
                  <div className="wa-chat-row-top">
                    <span className="wa-chat-title">
                      #{room.displayName || room.name}
                    </span>
                    <span className="wa-group-badge">Group</span>
                  </div>
                  <div className="wa-chat-row-bottom">
                    <span className="wa-chat-snippet">
                      {room.topic || 'Tap to start messaging...'}
                    </span>
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
