import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import LoadingDots from '../components/LoadingDots';
import { chatAPI } from '../services/api';

const TONES = [
  { id: 'witty', icon: '✨', label: 'Witty & Charming' },
  { id: 'romantic', icon: '🤍', label: 'Romantic & Tender' },
  { id: 'sincere', icon: '🎭', label: 'Sincere & Deep' },
  { id: 'poetic', icon: '📖', label: 'Poetic & Dreamy' },
];

const MEMORIES = [
  { category: 'Preference', text: 'Loves Earl Grey with a hint of lavender', time: 'Shared on Oct 12' },
  { category: 'Interest', text: 'Fascinated by vintage poetry and classical music', time: 'Shared on Oct 10' },
  { category: 'Life Event', text: 'Recently started a new chapter in their career', time: 'Shared on Oct 8' },
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTone, setSelectedTone] = useState('witty');
  const [warmth, setWarmth] = useState(0.7);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadHistory();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadHistory = async () => {
    try {
      const { data } = await chatAPI.getHistory(50);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load history');
    }
  };

  const handleSend = async (message) => {
    const userMsg = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { data } = await chatAPI.sendMessage(message, selectedTone, warmth);
      const aiMsg = {
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: "I'm sorry, something went wrong. Let's try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--cream)'
    }}>
      {/* LEFT SIDEBAR */}
      <aside style={{
        width: '260px',
        flexShrink: 0,
        height: '100vh',
        background: 'var(--warm-white)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div className="sidebar-header">
          <div className="logo-icon">❀</div>
          <h1>The Companion</h1>
        </div>

        <div className="section">
          <div className="section-label">Social Grace & Tone</div>
          <div className="tone-list">
            {TONES.map((tone) => (
              <motion.div
                key={tone.id}
                className={`tone-item ${selectedTone === tone.id ? 'selected' : ''}`}
                onClick={() => setSelectedTone(tone.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{tone.icon}</span>
                <span>{tone.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Correspondence
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              +
            </motion.button>
          </div>
        </div>

        <div className="conversation-list">
          <div className="conv-item active">
            <div className="conv-icon">🕐</div>
            <div>
              <div className="conv-title">Our First Day</div>
              <div className="conv-preview">Hello! It's so nice to meet you...</div>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">S</div>
          <div className="user-info">
            <div className="user-name">Seraphina</div>
            <div className="user-tier">Standard Membership</div>
          </div>
          <button className="settings-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* MIDDLE COLUMN */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--cream)'
      }}>
        {/* CHAT HEADER */}
        <Header onLogout={handleLogout} />

        {/* MESSAGES AREA - ONLY THIS SCROLLS */}
        <div className="chat-messages">
          {messages.length === 0 && !isTyping && (
            <div className="empty-chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <p>Start a conversation with Eloise</p>
            </div>
          )}

          <div className="quote-bar">
            "Every word exchanged is a thread in our tapestry."
          </div>

          <AnimatePresence>
            {messages.map((msg, index) => (
              <ChatBubble
                key={index}
                message={msg}
                isUser={msg.role === 'user'}
              />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingDots />
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA - FIXED AT BOTTOM */}
        <ChatInput 
          onSend={handleSend} 
          disabled={isTyping}
          warmth={warmth}
          onWarmthChange={setWarmth}
        />
      </div>

      {/* RIGHT SIDEBAR */}
      <aside style={{
        width: '280px',
        flexShrink: 0,
        height: '100vh',
        background: 'var(--warm-white)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div className="memories-header">
          <h3>
            Memories 
            <span className="beta-badge">Beta</span>
          </h3>
          <p>Details I hold dear to my heart.</p>
        </div>

        {MEMORIES.map((mem, idx) => (
          <div className="memory-card" key={idx}>
            <div className="memory-category">{mem.category}</div>
            <div className="memory-text">"{mem.text}"</div>
            <div className="memory-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {mem.time}
            </div>
          </div>
        ))}

        <button className="pin-memory-btn">+ Pin a New Memory</button>

        <div className="connection-settings">
          <div className="connection-toggle">
            <h4>Connection Settings</h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div className="setting-row">
            <span className="setting-label">Active Listening</span>
            <span className="setting-badge">On</span>
          </div>
          <div className="setting-row">
            <span className="setting-label">Memory Retention</span>
            <span className="setting-badge">Indefinite</span>
          </div>
          <a href="#" className="download-link">Download Journal Export</a>
        </div>
      </aside>
    </div>
  );
}