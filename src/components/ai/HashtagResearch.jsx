import React, { useState } from 'react';
import { Hash, Search, Copy, Check, TrendingUp } from 'lucide-react';
import { researchHashtags } from '../../services/aiEngine';

export default function HashtagResearch() {
  const [topic, setTopic] = useState('marketing');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedGroup, setCopiedGroup] = useState(null);

  const handleResearch = async () => {
    setLoading(true);
    try {
      const res = await researchHashtags(topic);
      setResults(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTags = (tags, groupName) => {
    const text = tags.map(t => t.tag).join(' ');
    navigator.clipboard.writeText(text);
    setCopiedGroup(groupName);
    setTimeout(() => setCopiedGroup(null), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
          #️⃣ AI Hashtag Density Research
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Discover high-impact, medium-competition, and niche hashtags to maximize organic reach.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '600px' }}>
        <input
          type="text"
          className="input-control"
          placeholder="Enter keyword (e.g. saas, fitness, AI)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleResearch} disabled={loading}>
          <Search size={18} /> Research
        </button>
      </div>

      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* High Density */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#f59e0b' }}>
                🔥 High Density (Broad)
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopyTags(results.highVolume, 'high')}>
                {copiedGroup === 'high' ? <Check size={14} color="#10b981" /> : <Copy size={14} />} Copy
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.highVolume.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{h.tag}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{h.reach}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Niche Targeted */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#06b6d4' }}>
                🎯 Niche Targeted (Recommended)
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopyTags(results.nicheTargeted, 'niche')}>
                {copiedGroup === 'niche' ? <Check size={14} color="#10b981" /> : <Copy size={14} />} Copy
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.nicheTargeted.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#22d3ee' }}>{h.tag}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{h.reach}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Competition */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#10b981' }}>
                🌱 Low Competition (High Conversion)
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopyTags(results.lowCompetition, 'low')}>
                {copiedGroup === 'low' ? <Check size={14} color="#10b981" /> : <Copy size={14} />} Copy
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.lowCompetition.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#34d399' }}>{h.tag}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{h.reach}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
