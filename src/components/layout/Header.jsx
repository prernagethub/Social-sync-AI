import React from 'react';
import { Plus, Sparkles, Search, ChevronDown, Bell, Filter } from 'lucide-react';
import { db } from '../../services/db';

export default function Header({ onOpenCreatePost, onOpenAIStudio, filterPlatform, setFilterPlatform, currentWorkspace, onSwitchWorkspace }) {
  const workspaces = db.getWorkspaces();

  return (
    <header style={{
      height: '70px',
      padding: '0 24px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(8, 11, 17, 0.7)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Left: Workspace Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <select
            className="select-control"
            value={currentWorkspace?.id || 'ws-1'}
            onChange={(e) => onSwitchWorkspace(e.target.value)}
            style={{
              padding: '8px 32px 8px 12px',
              fontSize: '0.9rem',
              fontWeight: '700',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id} style={{ background: '#0d121f' }}>
                {ws.logo} {ws.name} ({ws.role})
              </option>
            ))}
          </select>
        </div>

        {/* Platform Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['all', 'linkedin', 'twitter', 'instagram', 'tiktok', 'facebook'].map(plat => (
            <button
              key={plat}
              onClick={() => setFilterPlatform(plat)}
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: filterPlatform === plat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: filterPlatform === plat ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                color: filterPlatform === plat ? '#c084fc' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {plat === 'all' ? '🌐 All Channels' : plat}
            </button>
          ))}
        </div>
      </div>

      {/* Right Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn-secondary btn-sm" onClick={onOpenAIStudio}>
          <Sparkles size={16} color="#06b6d4" /> AI Content Studio
        </button>

        <button className="btn btn-primary btn-sm" onClick={onOpenCreatePost}>
          <Plus size={18} /> Create Post
        </button>
      </div>
    </header>
  );
}
