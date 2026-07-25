import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Navbar({ onOpenAuth, onLaunchApp, user }) {
  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 15,
      zIndex: 100,
      margin: '0 20px 20px 20px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onLaunchApp}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px var(--primary-glow)'
        }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SocialSync
          </span>
          <span className="badge badge-glow" style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '2px 6px' }}>AI</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Features</a>
        <a href="#sandbox" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>AI Generator</a>
        <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Pricing</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <button className="btn btn-primary btn-sm" onClick={onLaunchApp}>
            Launch App Dashboard <ArrowRight size={16} />
          </button>
        ) : (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenAuth('login')}>
              Sign In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('signup')}>
              Get Started Free <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
