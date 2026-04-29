import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import cinderellaImg from '../assets/cinderella.svg';

const blobs = [
  { w: 420, h: 420, top: '-10%', left: '-12%', color: 'rgba(255,182,213,0.45)', delay: 0 },
  { w: 360, h: 360, top: '55%',  left: '65%',  color: 'rgba(216,160,240,0.4)',  delay: 1.5 },
  { w: 280, h: 280, top: '70%',  left: '-8%',  color: 'rgba(255,210,230,0.35)', delay: 0.8 },
  { w: 240, h: 240, top: '10%',  left: '72%',  color: 'rgba(252,196,228,0.4)',  delay: 2 },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="girly-page">

      {/* Soft bokeh blobs */}
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: 'fixed',
            width: b.w, height: b.h,
            top: b.top, left: b.left,
            borderRadius: '50%',
            background: b.color,
            filter: 'blur(72px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7 + i * 1.2, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        className="girly-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header accent bar */}
        <div className="girly-ribbon" />

        {/* Logo */}
        <div className="girly-logo">
          <motion.div
            className="girly-badge"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={cinderellaImg}
              alt="princess"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                mixBlendMode: 'multiply',
              }}
            />
          </motion.div>
          <h1>LiliLand</h1>
          <p>Where gentle conversations unfold</p>
        </div>

        {error && (
          <motion.div className="girly-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="girly-field">
            <label>Email</label>
            <div className="girly-input-wrap">
              <svg className="girly-input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9z" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2.5 5.5L10 11l7.5-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="girly-field">
            <label>Password</label>
            <div className="girly-input-wrap">
              <svg className="girly-input-icon" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="10" cy="13" r="1.2" fill="currentColor"/>
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className="girly-btn"
            disabled={loading}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
          >
            {loading ? 'Just a moment…' : 'Enter LiliLand'}
          </motion.button>
        </form>

        <div className="girly-divider">
          <span />  <p>new here?</p>  <span />
        </div>

        <Link to="/register" className="girly-signup-btn">
          Create your account
        </Link>

        <div className="girly-dots">
          {[...Array(3)].map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.3}s` }} />)}
        </div>
      </motion.div>
    </div>
  );
}
