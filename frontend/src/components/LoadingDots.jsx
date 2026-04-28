import { motion } from 'framer-motion';

export default function LoadingDots() {
  return (
    <motion.div
      className="typing-indicator"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        className="typing-dot"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="typing-dot"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        className="typing-dot"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </motion.div>
  );
}