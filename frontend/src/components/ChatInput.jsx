import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ChatInput({ onSend, disabled, warmth, onWarmthChange }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form className="chat-input-area" onSubmit={handleSubmit}>
      <div className="input-card">
        <div className="warmth-slider">
          <span className="warmth-label">Reply Warmth</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={warmth}
            onChange={(e) => onWarmthChange(parseFloat(e.target.value))}
            disabled={disabled}
          />
        </div>
        <div className="input-row">
          <motion.input
            type="text"
            className="chat-input"
            placeholder="Share a thought, a worry, or a verse..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            type="submit"
            className="send-button"
            disabled={disabled || !message.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
            </svg>
          </motion.button>
        </div>
      </div>
    </form>
  );
}