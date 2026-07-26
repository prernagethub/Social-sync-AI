import React from 'react';
import { Shield, X, LogIn } from 'lucide-react';

export default function AuthModal({
  authModalOpen,
  setAuthModalOpen,
  authMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  handleAuthSubmit
}) {
  if (!authModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
              {authMode === 'login' ? 'Sign In to SocialSync' : 'Create Account'}
            </h2>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setAuthModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAuthSubmit}>
          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Alex Morgan"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="input-control"
              placeholder="alex@company.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px' }}>
            <LogIn size={16} /> {authMode === 'login' ? 'Sign In & View My Calendar' : 'Create Free Account'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              setAuthEmail('rajputprerna03@gmail.com');
              setAuthName('Prerna Rajput');
              handleAuthSubmit({ preventDefault: () => {} });
            }}
          >
            ⚡ 1-Click Instant Demo Login
          </button>
        </div>
      </div>
    </div>
  );
}
