import React from 'react';
import { Calendar, Wand2, Kanban, BarChart3, Users, Settings, Sparkles, Home, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onGoLanding, onLogout, user }) {
  const menuItems = [
    { id: 'calendar', label: 'Content Calendar', icon: <Calendar size={18} /> },
    { id: 'ai-studio', label: 'AI Content Studio', icon: <Wand2 size={18} />, badge: 'AI' },
    { id: 'kanban', label: 'Kanban Pipeline', icon: <Kanban size={18} /> },
    { id: 'analytics', label: 'Analytics & Predictions', icon: <BarChart3 size={18} /> },
    { id: 'team', label: 'Team & Settings', icon: <Users size={18} /> }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(11, 15, 25, 0.95)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px var(--primary-glow)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>SocialSync AI</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Collaborative Workspace</div>
          </div>
        </div>

        {/* Menu Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && <span className="badge badge-glow" style={{ fontSize: '0.65rem' }}>{item.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={onGoLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Home size={16} /> Landing Page View
        </button>

        {/* User Card */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <img src={user.avatar} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
            </div>
            <button title="Sign Out" onClick={onLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
