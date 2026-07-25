import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { db } from '../../services/db';

export default function CommentsThread({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const loadComments = () => {
    if (postId) {
      setComments(db.getComments(postId));
    }
  };

  useEffect(() => {
    loadComments();
    const unsubscribe = db.subscribe(() => loadComments());
    return () => unsubscribe();
  }, [postId]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const author = currentUser ? currentUser.name : 'Alex Morgan';
    const avatar = currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

    db.addComment(postId, author, avatar, text.trim());
    setText('');
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <MessageSquare size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
          Team Revision Notes & Comments ({comments.length})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', marginBottom: '14px', paddingRight: '4px' }}>
        {comments.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No comments yet. Leave a revision note for your team!
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <img src={c.avatar} alt={c.author} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>{c.author}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input-control"
          placeholder="Write feedback or request changes..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontSize: '0.82rem' }}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  );
}
