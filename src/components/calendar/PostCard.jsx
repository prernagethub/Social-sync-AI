import React from 'react';
import { Calendar, Clock, MessageSquare, Sparkles, BarChart2, Edit3, Trash2 } from 'lucide-react';

export default function PostCard({ post, onEdit, onDelete }) {
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'facebook': return '📘';
      default: return '🌐';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'idea': return <span className="badge status-idea">💡 Idea</span>;
      case 'draft': return <span className="badge status-draft">📝 Draft</span>;
      case 'in_review': return <span className="badge status-review">👀 In Review</span>;
      case 'scheduled': return <span className="badge status-scheduled">📅 Scheduled</span>;
      case 'published': return <span className="badge status-published">🚀 Published</span>;
      default: return null;
    }
  };

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '14px',
        borderRadius: '12px',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
      onClick={() => onEdit(post)}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.1rem' }}>{getPlatformIcon(post.platform)}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {post.platform}
          </span>
        </div>
        {getStatusBadge(post.status)}
      </div>

      {/* Title & Caption */}
      <div>
        <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>
          {post.title}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
          {post.caption}
        </p>
      </div>

      {/* Media Image Preview if available */}
      {post.mediaUrl && (
        <div style={{ width: '100%', height: '90px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <img src={post.mediaUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Footer Metrics & Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <Clock size={12} />
          <span>{post.scheduledDate} ({post.scheduledTime || '10:00'})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* AI Score Badge */}
          <div title="Predicted AI Engagement Score" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: '700', color: post.engagementScore >= 90 ? '#10b981' : '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
            <Sparkles size={10} /> {post.engagementScore}
          </div>

          <button
            title="Delete Post"
            onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
