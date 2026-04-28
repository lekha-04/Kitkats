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
        <div className="companion-avatar">L</div>
        <div className="companion-info">
          <h2>Lili</h2>
          <span className="companion-status">Present</span>
        </div>
      </div>
    </motion.header>
  );
}