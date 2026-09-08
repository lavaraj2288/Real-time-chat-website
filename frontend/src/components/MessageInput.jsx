import React, { useState, useRef, useEffect } from 'react';
import '../styles/MessageInput.css';

const QUICK_EMOJIS = ['👋', '😀', '🔥', '🚀', '❤️', '👍', '🎉', '💯'];

export default function MessageInput({ onSendMessage, onTyping, placeholder }) {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (isTypingRef.current && onTyping) onTyping(false);
    };
  }, [onTyping]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (onTyping) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTyping(true);
      }

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTyping(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingRef.current && onTyping) {
      isTypingRef.current = false;
      onTyping(false);
    }

    onSendMessage(trimmed);
    setText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="wa-input-container">
      {/* Quick emoji reactions toggle */}
      {showEmojis && (
        <div className="wa-emoji-bar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="wa-emoji-btn"
              onClick={() => handleAddEmoji(emoji)}
              title="Quick emoji"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="wa-input-row" onSubmit={handleSubmit}>
        <div className="wa-input-box">
          <button
            type="button"
            className="wa-btn-emoji-toggle"
            onClick={() => setShowEmojis(!showEmojis)}
            title="Toggle emojis"
          >
            😀
          </button>

          <textarea
            ref={textareaRef}
            className="wa-input-textarea"
            rows={1}
            placeholder={placeholder || 'Type a message...'}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          type="submit"
          className={`wa-btn-send ${text.trim() ? 'has-text' : ''}`}
          disabled={!text.trim()}
          title="Send message"
        >
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
