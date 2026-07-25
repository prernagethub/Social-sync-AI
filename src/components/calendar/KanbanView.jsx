import React from 'react';
import PostCard from './PostCard';
import { Plus } from 'lucide-react';

export default function KanbanView({ posts, onSelectPost, onCreateOnStatus, filterPlatform, onDeletePost }) {
  const columns = [
    { id: 'idea', label: '💡 Ideas & Hooks', color: 'var(--status-idea)' },
    { id: 'draft', label: '📝 Content Drafts', color: 'var(--status-draft)' },
    { id: 'in_review', label: '👀 In Review', color: 'var(--status-review)' },
    { id: 'scheduled', label: '📅 Scheduled', color: 'var(--status-scheduled)' },
    { id: 'published', label: '🚀 Published', color: 'var(--status-published)' }
  ];

  const filteredPosts = posts.filter(p => {
    if (filterPlatform && filterPlatform !== 'all' && p.platform !== filterPlatform) return false;
    return true;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>
        Kanban Content Pipeline
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        alignItems: 'start',
        overflowX: 'auto',
        paddingBottom: '20px'
      }}>
        {columns.map(col => {
          const colPosts = filteredPosts.filter(p => p.status === col.id);
          return (
            <div
              key={col.id}
              style={{
                background: 'rgba(11, 15, 25, 0.7)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                padding: '16px',
                minWidth: '260px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{col.label}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                    {colPosts.length}
                  </span>
                </div>
                <button
                  title={`Add ${col.label}`}
                  onClick={() => onCreateOnStatus(col.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Column Posts Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
                {colPosts.length === 0 ? (
                  <div style={{ border: '2px dashed var(--border-color)', borderRadius: '10px', padding: '24px 12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    No posts in this column
                  </div>
                ) : (
                  colPosts.map(p => (
                    <PostCard key={p.id} post={p} onEdit={onSelectPost} onDelete={onDeletePost} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
