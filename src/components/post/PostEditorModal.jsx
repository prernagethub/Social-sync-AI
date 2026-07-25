import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Clock, Image, Wand2, Check, Eye, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import PlatformPreview from './PlatformPreview';
import CommentsThread from './CommentsThread';
import { predictEngagement } from '../../services/aiEngine';

export default function PostEditorModal({ post, onClose, onSave, currentUser }) {
  const [title, setTitle] = useState(post?.title || 'New Post Concept');
  const [platform, setPlatform] = useState(post?.platform || 'linkedin');
  const [status, setStatus] = useState(post?.status || 'draft');
  const [scheduledDate, setScheduledDate] = useState(post?.scheduledDate || new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState(post?.scheduledTime || '10:00');
  const [caption, setCaption] = useState(post?.caption || '');
  const [mediaUrl, setMediaUrl] = useState(post?.mediaUrl || '');

  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const res = predictEngagement({ caption, platform, scheduledTime });
    setPrediction(res);
  }, [caption, platform, scheduledTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === 'published') {
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
    }

    onSave({
      ...(post || {}),
      title,
      platform,
      status,
      scheduledDate,
      scheduledTime,
      caption,
      mediaUrl: mediaUrl.trim() || null,
      engagementScore: prediction ? prediction.score : 85,
      author: post?.author || (currentUser ? currentUser.name : 'Alex Morgan')
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>
              {post?.id ? 'Edit Post Schedule' : 'Create New Post Draft'}
            </span>
            {prediction && (
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: prediction.gradeColor, border: `1px solid ${prediction.gradeColor}` }}>
                <Sparkles size={12} /> AI Score {prediction.score}/100 (Grade {prediction.grade})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ background: activeTab === 'editor' ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none' }}
                onClick={() => setActiveTab('editor')}
              >
                <Edit3 size={14} /> Editor
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ background: activeTab === 'preview' ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none' }}
                onClick={() => setActiveTab('preview')}
              >
                <Eye size={14} /> Platform Preview
              </button>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'editor' ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Internal Post Title / Headline</label>
                <input
                  type="text"
                  className="input-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Platform</label>
                <select className="select-control" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="linkedin">💼 LinkedIn</option>
                  <option value="twitter">🐦 X / Twitter</option>
                  <option value="instagram">📸 Instagram</option>
                  <option value="tiktok">🎵 TikTok</option>
                  <option value="facebook">📘 Facebook</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Publishing Lifecycle Status</label>
                <select className="select-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="idea">💡 Idea Stage</option>
                  <option value="draft">📝 Draft</option>
                  <option value="in_review">👀 In Review</option>
                  <option value="scheduled">📅 Scheduled</option>
                  <option value="published">🚀 Published</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input
                  type="date"
                  className="input-control"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input
                  type="time"
                  className="input-control"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Media Asset Image URL (Optional)</label>
              <input
                type="url"
                className="input-control"
                placeholder="https://images.unsplash.com/..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Caption Copy</label>
              <textarea
                className="textarea-control"
                rows={6}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write caption text..."
              />
            </div>

            {/* Comments Component for Existing Posts */}
            {post?.id && <CommentsThread postId={post.id} currentUser={currentUser} />}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={18} /> Save Post Schedule
              </button>
            </div>
          </form>
        ) : (
          /* Live Platform Preview Tab */
          <div style={{ padding: '10px 0' }}>
            <PlatformPreview post={{ title, platform, status, caption, mediaUrl }} platform={platform} />
          </div>
        )}
      </div>
    </div>
  );
}
