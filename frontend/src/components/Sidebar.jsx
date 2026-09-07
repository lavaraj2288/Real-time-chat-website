import React, { useState } from 'react';

export default function Sidebar({
  rooms,
  currentRoom,
  onSelectRoom,
  currentUser,
  onLogout,
  onOpenCreateRoom,
  isMobileOpen,
  onCloseMobile
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      (r.displayName && r.displayName.toLowerCase().includes(term))
    );
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="brand-icon">⚡</div>
          <span className="brand-title">PulseChat</span>
        </div>
        {isMobileOpen && (
          <button
            className="btn-close-panel"
            onClick={onCloseMobile}
            title="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="sidebar-search">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Section Header */}
      <div className="sidebar-section-header">
        <span className="section-label">Channels ({rooms.length})</span>
        <button
          type="button"
          className="btn-icon-add"
          title="Create New Channel"
          onClick={onOpenCreateRoom}
        >
          +
        </button>
      </div>

      {/* Rooms List */}
      <div className="rooms-list">
        {filteredRooms.length === 0 ? (
          <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            No rooms found
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isActive = currentRoom && currentRoom.name === room.name;
            return (
              <button
                key={room._id || room.name}
                type="button"
                className={`room-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectRoom(room);
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <span className="room-prefix">#</span>
                <div className="room-info">
                  <div className="room-name">
                    {room.displayName || room.name}
                  </div>
                  {room.topic && (
                    <div className="room-subtext">{room.topic}</div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-badge">
          <div
            className="avatar-circle status-dot"
            style={{ backgroundColor: currentUser?.avatarColor || '#4F46E5' }}
          >
            {getInitials(currentUser?.username)}
          </div>
          <div className="user-meta">
            <div className="user-name">{currentUser?.username}</div>
            <div className="user-tag">
              {currentUser?.isGuest ? 'Guest Mode' : 'Member'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-logout"
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
    </aside>
  );
}
