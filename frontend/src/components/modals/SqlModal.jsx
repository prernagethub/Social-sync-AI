import React from 'react';
import { Database, X, Copy, Check } from 'lucide-react';

export default function SqlModal({
  sqlModalOpen,
  setSqlModalOpen,
  SQL_SCHEMA_SCRIPT,
  handleCopySql,
  copiedSql
}) {
  if (!sqlModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setSqlModalOpen(false)}>
      <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Supabase SQL Schema Helper</h2>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSqlModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Your post title & copy saved successfully! To enable persistent image URLs in your Supabase cloud PostgreSQL, copy and run this 1-line SQL query in your Supabase SQL Editor:
        </p>

        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '10px', position: 'relative', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <pre style={{ color: '#38bdf8', fontSize: '0.85rem', fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap' }}>{SQL_SCHEMA_SCRIPT}</pre>
          <button
            onClick={handleCopySql}
            className="btn btn-secondary btn-sm"
            style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.75rem', padding: '4px 8px' }}
          >
            {copiedSql ? <Check size={14} color="#34d399" /> : <Copy size={14} />} {copiedSql ? 'Copied!' : 'Copy SQL'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setSqlModalOpen(false)}>Got It, Close</button>
        </div>
      </div>
    </div>
  );
}
