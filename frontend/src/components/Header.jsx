import { motion } from 'framer-motion';

export default function Header({ onLogout }) {
  return (
    <motion.header
      className="chat-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chat-header-left">
        <div className="companion-avatar">E</div>
        <div className="companion-info">
          <h2>Eloise</h2>
          <span className="companion-status">Charming Companion · Present</span>
        </div>
      </div>
      <motion.button
        className="menu-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </motion.button>
    </motion.header>
  );
}