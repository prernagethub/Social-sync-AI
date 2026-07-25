import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Repeat, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export default function PlatformPreview({ post, platform }) {
  const currentPlatform = platform || post.platform || 'linkedin';
  const authorName = post.author || 'Alex Morgan';
  const authorTitle = 'Head of Growth & AI Strategy';
  const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  if (currentPlatform === 'linkedin') {
    return (
      <div style={{ background: '#1b1f23', border: '1px solid #38434f', borderRadius: '10px', padding: '16px', color: '#e9e9e9', fontFamily: '-apple-system, sans-serif' }}>
        {/* LinkedIn Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <img src={avatar} alt={authorName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{authorName}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{authorTitle}</div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>1h • 🌐</div>
            </div>
          </div>
          <MoreHorizontal size={18} color="#9ca3af" />
        </div>

        {/* Caption */}
        <div style={{ fontSize: '0.88rem', lineHeight: 1.5, whiteSpace: 'pre-line', marginBottom: '12px' }}>
          {post.caption || 'Write your caption to see preview...'}
        </div>

        {/* Media */}
        {post.mediaUrl && (
          <div style={{ borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #38434f' }}>
            <img src={post.mediaUrl} alt="Post media" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
          </div>
        )}

        {/* Footer Reactions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #38434f', paddingTop: '10px', fontSize: '0.8rem', color: '#9ca3af' }}>
          <span>👍 💡 👏 142 reactions</span>
          <span>18 comments • 6 reposts</span>
        </div>
      </div>
    );
  }

  if (currentPlatform === 'twitter') {
    return (
      <div style={{ background: '#000', border: '1px solid #2f3336', borderRadius: '14px', padding: '16px', color: '#e7e9ea', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <img src={avatar} alt={authorName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{authorName}</span>
              <CheckCircle2 size={14} color="#1d9bf0" />
              <span style={{ fontSize: '0.85rem', color: '#71767b' }}>@alex_morgan</span>
              <span style={{ fontSize: '0.85rem', color: '#71767b' }}>• 2h</span>
            </div>

            <div style={{ fontSize: '0.92rem', lineHeight: 1.45, whiteSpace: 'pre-line', margin: '8px 0 12px 0' }}>
              {post.caption || 'Write your post...'}
            </div>

            {post.mediaUrl && (
              <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #2f3336' }}>
                <img src={post.mediaUrl} alt="Media" style={{ width: '100%', maxHeight: '260px', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71767b', fontSize: '0.8rem', maxWidth: '350px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={15} /> 24</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Repeat size={15} /> 12</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={15} /> 184</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bookmark size={15} /> 45</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPlatform === 'instagram') {
    return (
      <div style={{ background: '#000', border: '1px solid #262626', borderRadius: '12px', padding: '0 0 12px 0', color: '#fff', maxWidth: '360px', margin: '0 auto' }}>
        {/* IG Top */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={avatar} alt={authorName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>alex_morgan</span>
          </div>
          <MoreHorizontal size={18} />
        </div>

        {/* Media */}
        <div style={{ width: '100%', height: '280px', background: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {post.mediaUrl ? (
            <img src={post.mediaUrl} alt="IG post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: '#555', fontSize: '0.85rem' }}>[Image Media Asset]</div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '10px 12px 4px 12px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <Heart size={20} />
            <MessageCircle size={20} />
            <Share2 size={20} />
          </div>
          <Bookmark size={20} />
        </div>

        {/* Caption */}
        <div style={{ padding: '0 12px', fontSize: '0.82rem', lineHeight: 1.4 }}>
          <span style={{ fontWeight: '700', marginRight: '6px' }}>alex_morgan</span>
          <span style={{ whiteSpace: 'pre-line' }}>{post.caption}</span>
        </div>
      </div>
    );
  }

  // TikTok Preview Default
  return (
    <div style={{ background: '#121212', borderRadius: '16px', height: '380px', width: '240px', margin: '0 auto', position: 'relative', overflow: 'hidden', color: '#fff', border: '1px solid #333' }}>
      {post.mediaUrl ? (
        <img src={post.mediaUrl} alt="TikTok" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)' }} />
      )}
      <div style={{ position: 'absolute', bottom: '16px', left: '12px', right: '50px', fontSize: '0.75rem', lineHeight: 1.3 }}>
        <div style={{ fontWeight: '700', marginBottom: '4px' }}>@alex_morgan</div>
        <div style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.caption}</div>
      </div>
    </div>
  );
}
