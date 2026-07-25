import React, { useState } from 'react';
import { Users, Shield, Key, Sparkles, Check, Plus, UserCheck } from 'lucide-react';
import { db } from '../../services/db';

export default function TeamSettings({ currentWorkspace, currentUser }) {
  const [apiKey, setApiKey] = useState(db.getApiKey('gemini') || '');
  const [savedKey, setSavedKey] = useState(false);
  const [brandVoice, setBrandVoice] = useState('Authoritative, data-backed, punchy, no corporate jargon.');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invited, setInvited] = useState(false);

  const members = currentWorkspace?.members || [
    { id: 'usr-1', name: 'Alex Morgan', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { id: 'usr-2', name: 'Sarah Chen', role: 'Lead Editor', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' }
  ];

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    db.setApiKey('gemini', apiKey.trim());
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInvited(true);
    setInviteEmail('');
    setTimeout(() => setInvited(false), 3000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>
          👥 Team Collaboration & Workspace Settings
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage brand members, custom AI voice guidelines, and API key integrations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Team Members */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Active Team Members</h3>
            <span className="badge badge-cyan">{members.length} Members</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={m.avatar} alt={m.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.role}</div>
                  </div>
                </div>
                <span className="badge badge-glow" style={{ fontSize: '0.7rem' }}>{m.role}</span>
              </div>
            ))}
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInvite} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <label className="form-label">Invite New Team Member</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="email"
                className="input-control"
                placeholder="colleague@brand.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={16} /> Invite
              </button>
            </div>
            {invited && (
              <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '6px' }}>
                ✓ Invitation email sent successfully!
              </div>
            )}
          </form>
        </div>

        {/* AI & API Key Settings */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
              🤖 Custom AI & Brand Voice Setup
            </h3>

            <div className="form-group">
              <label className="form-label">Brand Voice & Persona Guidelines</label>
              <textarea
                className="textarea-control"
                rows={3}
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
              />
            </div>

            <form onSubmit={handleSaveApiKey} className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Custom Gemini / OpenAI API Key (Optional)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  className="input-control"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button type="submit" className="btn btn-cyan btn-sm">
                  {savedKey ? <Check size={16} /> : <Key size={16} />} Save
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                If left blank, SocialSync uses built-in smart AI generation algorithms.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
