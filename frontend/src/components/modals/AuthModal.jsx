import React from 'react';
import { Shield, X, LogIn, UserPlus, Database, AlertCircle, Key, Lock } from 'lucide-react';

export default function AuthModal({
  authModalOpen,
  setAuthModalOpen,
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authTitle,
  setAuthTitle,
  authError,
  setAuthError,
  isSubmitting,
  handleAuthSubmit,
  handleGoogleAuth
}) {
  if (!authModalOpen) return null;

  const isSignUp = authMode === 'signup';

  return (
    <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="modal-container" style={{ maxWidth: '460px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header with Title and Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: '#a78bfa' }}>
              {isSignUp ? <UserPlus size={22} /> : <Shield size={22} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, lineHeight: 1.2 }}>
                {isSignUp ? 'Create New Account' : 'Welcome Back'}
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Lock size={12} color="#06b6d4" /> Supabase Auth & Google OAuth Secured
              </span>
            </div>
          </div>
          <button
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            onClick={() => {
              if (setAuthError) setAuthError('');
              setAuthModalOpen(false);
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs (Sign In vs Sign Up) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '18px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: !isSignUp ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
              color: !isSignUp ? '#fff' : 'var(--text-muted)',
              boxShadow: !isSignUp ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
            }}
            onClick={() => {
              if (setAuthError) setAuthError('');
              if (setAuthMode) setAuthMode('login');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isSignUp ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              color: isSignUp ? '#fff' : 'var(--text-muted)',
              boxShadow: isSignUp ? '0 2px 8px rgba(6, 182, 212, 0.3)' : 'none'
            }}
            onClick={() => {
              if (setAuthError) setAuthError('');
              if (setAuthMode) setAuthMode('signup');
            }}
          >
            Create Account
          </button>
        </div>

        {/* ASPECT 1: Google OAuth 1-Click Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '10px',
            padding: '11px 16px',
            borderRadius: '10px',
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            marginBottom: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {isSignUp ? 'Sign Up with Google' : 'Sign In with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>or with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {/* Error Alert Message */}
        {authError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1.5px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontSize: '0.88rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, color: '#ef4444' }} />
            <div style={{ flex: 1 }}>{authError}</div>
          </div>
        )}

        {/* Auth Form (ASPECT 2: Sign In / ASPECT 3: Sign Up Form) */}
        <form onSubmit={handleAuthSubmit}>
          {isSignUp && (
            <>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Full Name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required={isSignUp}
                />
              </div>

              {setAuthTitle && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Title / Role (Optional)</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Social Media Manager"
                    value={authTitle || ''}
                    onChange={(e) => setAuthTitle(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="input-control"
              placeholder="you@company.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn ${isSignUp ? 'btn-cyan' : 'btn-primary'}`}
            style={{
              width: '100%',
              justify: 'center',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              borderRadius: '10px'
            }}
          >
            {isSubmitting ? (
              'Authenticating with Supabase...'
            ) : isSignUp ? (
              <>
                <UserPlus size={18} /> Create Free Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In & Access Dashboard
              </>
            )}
          </button>
        </form>

        {/* Footer Mode Switcher Link */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                onClick={() => {
                  if (setAuthError) setAuthError('');
                  if (setAuthMode) setAuthMode('login');
                }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#06b6d4', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                onClick={() => {
                  if (setAuthError) setAuthError('');
                  if (setAuthMode) setAuthMode('signup');
                }}
              >
                Create Account (Sign Up)
              </button>
            </span>
          )}
        </div>

        {/* 1-Click Demo Login */}
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '14px', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              if (setAuthError) setAuthError('');
              setAuthEmail('xyz@gmail.com');
              setAuthName('**********');
              if (setAuthMode) setAuthMode('login');
              setTimeout(() => {
                handleAuthSubmit({ preventDefault: () => { } });
              }, 50);
            }}
          >
            ⚡ 1-Click Instant Demo Login
          </button>
        </div>
      </div>
    </div>
  );
}
