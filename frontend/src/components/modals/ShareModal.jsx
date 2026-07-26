import React from 'react';
import { Share2, X, Copy, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShareModal({ shareModalOpen, setShareModalOpen }) {
  if (!shareModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setShareModalOpen(false)}>
      <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 size={22} color="#06b6d4" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Shareable Client Link</h2>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShareModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Share this live read-only link with your clients or stakeholders to let them view your scheduled content calendar without signing in:
        </p>

        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <input
            type="text"
            readOnly
            className="input-control"
            value={`${window.location.origin}/share/calendar`}
            style={{ fontSize: '0.85rem', flex: 1, color: '#38bdf8' }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/share/calendar`);
              toast.success('Public share link copied to clipboard! 📋', { autoClose: 2000 });
            }}
          >
            <Copy size={14} /> Copy Link
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { window.open('/share/calendar', '_blank'); }}>
            <Eye size={14} /> Open Live Preview
          </button>
          <button className="btn btn-cyan btn-sm" onClick={() => setShareModalOpen(false)}>Done</button>
        </div>
      </div>
    </div>
  );
}
