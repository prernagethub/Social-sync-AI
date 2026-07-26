import React from 'react';
import { X, Clock, Check } from 'lucide-react';

export default function PostModal({
  modalOpen,
  closeModal,
  editingPost,
  handleApplyAiBestTime,
  handleSavePost,
  title,
  setTitle,
  platform,
  setPlatform,
  status,
  setStatus,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  caption,
  setCaption,
  handleImageFileChange,
  imageUrl,
  setImageUrl,
  imagePreview,
  setImagePreview
}) {
  if (!modalOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>{editingPost ? 'Edit Scheduled Post' : 'Schedule New Post'}</h2>
            <button
              type="button"
              onClick={handleApplyAiBestTime}
              style={{ padding: '4px 10px', borderRadius: '15px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.5)', color: '#c084fc', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Clock size={12} /> 💡 Auto-Fill AI Best Time
            </button>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={closeModal}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSavePost}>
          <div className="form-group">
            <label className="form-label">Post Title *</label>
            <input type="text" className="input-control" placeholder="Post title..." value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Target Platform</label>
              <select className="select-control" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="twitter">🐦 X / Twitter</option>
                <option value="instagram">📸 Instagram</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Post Status</label>
              <select className="select-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">📝 Draft</option>
                <option value="scheduled">📅 Scheduled</option>
                <option value="published">🚀 Published</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Date *</label>
              <input type="date" className="input-control" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Time *</label>
              <input type="time" className="input-control" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} required />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Caption Copy</label>
            <textarea className="textarea-control" rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write caption..." />
          </div>

          {/* PHOTO / IMAGE UPLOAD & LINK INPUT */}
          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Attach Photo / Media Image</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>OR</span>
              <input
                type="url"
                className="input-control"
                placeholder="Paste image URL..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                style={{ flex: 1 }}
              />
            </div>

            {imagePreview && (
              <div style={{ marginTop: '10px', position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '160px' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <button
                  type="button"
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => { setImageUrl(''); setImagePreview(''); }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary"><Check size={18} /> {editingPost ? 'Update Post' : 'Schedule & Save Post'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
