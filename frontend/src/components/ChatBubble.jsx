import { motion } from 'framer-motion';

export default function ChatBubble({ message, isUser }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      className={`message ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="message-avatar">
        E
      </div>
      <div className="message-content">
        <div className="message-bubble">{message.content}</div>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </motion.div>
  );
}