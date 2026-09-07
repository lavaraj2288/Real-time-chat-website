import React, { useState } from 'react';
import { api } from '../services/api';

export default function CreateRoomModal({ currentUser, onClose, onRoomCreated }) {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a room handle');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createRoom({
        name: name.trim(),
        displayName: displayName.trim() || name.trim(),
        topic: topic.trim() || 'A new discussion channel',
        createdBy: currentUser?.username || 'anonymous'
      });

      if (res.success && res.room) {
        onRoomCreated(res.room);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div
        className="auth-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 420 }}
      >
        <div className="auth-header">
          <div className="auth-logo">📁</div>
          <h2 className="auth-title">Create Chat Room</h2>
          <p className="auth-subtitle">Add a dedicated channel for your topic</p>
        </div>

        <form className="auth-body" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Room Handle (slug)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. music-club"
              value={name}
              onChange={(e) =>
                setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))
              }
              required
              autoFocus
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Only lowercase letters, numbers, and dashes.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Display Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Music Club 🎵"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Topic / Purpose</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Share favorite tracks, albums and playlists"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              className="btn-primary"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
