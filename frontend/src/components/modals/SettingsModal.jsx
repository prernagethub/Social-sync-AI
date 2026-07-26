import React from 'react';
import { Key, X } from 'lucide-react';

export default function SettingsModal({
  settingsModalOpen,
  setSettingsModalOpen,
  userLinkedinToken,
  setUserLinkedinToken,
  toast
}) {
  if (!settingsModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setSettingsModalOpen(false)}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={22} color="#06b6d4" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Connect Social Media Accounts</h2>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSettingsModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSettingsModalOpen(false); toast.success('Social accounts updated! 🔑', { autoClose: 2000 }); }}>
          <div className="form-group">
            <label className="form-label">LinkedIn OAuth Access Token</label>
            <textarea className="textarea-control" rows={3} value={userLinkedinToken} onChange={(e) => setUserLinkedinToken(e.target.value)} placeholder="Paste personal LinkedIn token..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setSettingsModalOpen(false)}>Close</button>
            <button type="submit" className="btn btn-primary">Save Accounts</button>
          </div>
        </form>
      </div>
    </div>
  );
}
