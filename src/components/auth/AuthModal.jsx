import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { auth } from '../../services/auth';

export default function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Please provide your full name.');
      return;
    }

    try {
      if (mode === 'login') {
        const u = auth.login(email, password);
        onSuccess(u);
      } else {
        const u = auth.signUp(name, email, password);
        onSuccess(u);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleDemoLogin = (index) => {
    const u = auth.demoLogin(index);
    onSuccess(u);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} color="#8b5cf6" />
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>SocialSync AI</span>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '6px' }}>
          {mode === 'login' ? 'Welcome Back!' : 'Create Your AI Workspace'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
          {mode === 'login' ? 'Sign in to access your content calendar & team' : 'Start generating and scheduling posts in seconds'}
        </p>

        {/* Quick Demo Options */}
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px', padding: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#c084fc', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> Instant Demo One-Click Access
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleDemoLogin(0)} style={{ fontSize: '0.78rem' }}>
              👤 Demo Admin
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleDemoLogin(1)} style={{ fontSize: '0.78rem' }}>
              👩‍💻 Demo Editor
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', margin: '16px 0' }}>— OR USE EMAIL —</div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid #ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-control"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input-control"
              placeholder="alex@brand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '12px' }}>
            {mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => setMode('signup')}>
                Sign Up Free
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => setMode('login')}>
                Sign In
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
