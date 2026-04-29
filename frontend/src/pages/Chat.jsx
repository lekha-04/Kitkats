import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import LoadingDots from '../components/LoadingDots';
import { chatAPI, streamMessage } from '../services/api';
import princessImg from '../assets/princess.svg';

const TONES = [
  { id: 'witty',    icon: '✨', label: 'Witty & Charming' },
  { id: 'romantic', icon: '🤍', label: 'Romantic & Tender' },
  { id: 'sincere',  icon: '🎭', label: 'Sincere & Deep' },
  { id: 'poetic',   icon: '📖', label: 'Poetic & Dreamy' },
];

const TONE_THEME = {
  witty:    { bg: '#fef3e8', accent: '#c9934a', accentLight: '#f5e6d3' },
  romantic: { bg: '#fde8ed', accent: '#e8516a', accentLight: '#f9d8de' },
  sincere:  { bg: '#e8f4fd', accent: '#4a90c9', accentLight: '#d0e8f7' },
  poetic:   { bg: '#edd5e8', accent: '#9b3a6e', accentLight: '#f2c4d8' },
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTone, setSelectedTone] = useState('witty');
  const [warmth, setWarmth] = useState(0.7);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    loadConversations();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadConversations = async () => {
    try {
      const { data } = await chatAPI.listConversations();
      setConversations(data);
      if (data.length > 0) {
        selectConversation(data[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations.');
    }
  };

  const selectConversation = async (convId) => {
    setActiveConvId(convId);
    setMessages([]);
    try {
      const { data } = await chatAPI.getHistory(convId);
      setMessages(data.messages);
    } catch (err) {
      setError('Failed to load chat history.');
    }
  };

  const handleNewChat = async () => {
    try {
      const { data } = await chatAPI.newConversation();
      const newConv = { id: data.conversation_id, title: data.title, preview: 'No messages yet', updated_at: new Date().toISOString() };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(data.conversation_id);
      setMessages([]);
    } catch (err) {
      setError('Failed to create conversation.');
    }
  };

  const handleSend = (message) => {
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message, timestamp: now },
      { role: 'assistant', content: '', timestamp: now },
    ]);
    setIsTyping(true);
    setError('');

    let resolvedConvId = activeConvId;

    streamMessage(
      message, selectedTone, warmth, activeConvId,
      (token, returnedConvId) => {
        if (returnedConvId && !resolvedConvId) resolvedConvId = returnedConvId;
        setIsTyping(false);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + token };
          return updated;
        });
      },
      (returnedConvId) => {
        setIsTyping(false);
        const finalId = returnedConvId || resolvedConvId;
        if (finalId) {
          if (!activeConvId) setActiveConvId(finalId);
          setConversations((prev) => prev.map((c) =>
            c.id === finalId
              ? { ...c, title: message.length <= 40 ? message : message.slice(0, 40), updated_at: new Date().toISOString() }
              : c
          ));
        }
      },
      () => {
        setIsTyping(false);
        setError('Message failed to send. Please try again.');
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: "Something went wrong. Let's try again." };
          return updated;
        });
      }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const theme = TONE_THEME[selectedTone];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg, transition: 'background 0.5s ease' }}>

      {error && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', padding: '10px 20px', borderRadius: '8px', zIndex: 1000, fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          {error}
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside style={{ width: '260px', flexShrink: 0, height: '100vh', background: 'var(--warm-white)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="sidebar-header">
          <div className="logo-icon" style={{ background: 'none', padding: 0, overflow: 'hidden' }}>
            <img src={princessImg} alt="princess" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <h1>LiliLand</h1>
        </div>

        <div className="section">
          <div className="section-label">Social Grace & Tone</div>
          <div className="tone-list">
            {TONES.map((tone) => {
              const t = TONE_THEME[tone.id];
              const isSelected = selectedTone === tone.id;
              return (
                <motion.div
                  key={tone.id}
                  className="tone-item"
                  onClick={() => setSelectedTone(tone.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: isSelected ? t.accentLight : 'transparent',
                    color: isSelected ? t.accent : 'var(--text-secondary)',
                    fontWeight: isSelected ? 500 : 400,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span>{tone.icon}</span>
                  <span>{tone.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="section">
          <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Conversations
            <motion.button
              onClick={handleNewChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
              title="New Chat"
            >
              +
            </motion.button>
          </div>
        </div>

        <div className="conversation-list" style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              className={`conv-item ${activeConvId === conv.id ? 'active' : ''}`}
              onClick={() => selectConversation(conv.id)}
              whileHover={{ x: 3 }}
              style={{ cursor: 'pointer' }}
            >
              <div className="conv-icon">💬</div>
              <div style={{ overflow: 'hidden' }}>
                <div className="conv-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</div>
                <div className="conv-preview" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.preview}</div>
              </div>
            </motion.div>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              No conversations yet. Hit + to start.
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">{(currentUser.username || 'U')[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{currentUser.username || 'User'}</div>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: theme.bg, transition: 'background 0.5s ease' }}>
        <Header onLogout={handleLogout} />

        <div className="chat-messages">
          {messages.length === 0 && !isTyping && (
            <div className="empty-chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <p>Start a conversation with Lili</p>
            </div>
          )}

          <div className="quote-bar">

          </div>

          <AnimatePresence>
            {messages.map((msg, index) => (
              <ChatBubble key={index} message={msg} isUser={msg.role === 'user'} />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingDots />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping} warmth={warmth} onWarmthChange={setWarmth} />
      </div>

    </div>
  );
}
