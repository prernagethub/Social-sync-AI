import React, { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, ArrowRight } from 'lucide-react';
import { AI_TEMPLATES, generateCaption } from '../../services/aiEngine';

export default function CaptionWriter({ onCreatePostWithCaption }) {
  const [topic, setTopic] = useState('Why modern marketing teams are ditching traditional editorial spreadsheets for AI calendar workspaces');
  const [platform, setPlatform] = useState('linkedin');
  const [tone, setTone] = useState('punchy');
  const [keyPoints, setKeyPoints] = useState('1. AI predicts engagement before posting\n2. Real-time multi-platform previews\n3. Integrated team comment approvals');
  const [cta, setCta] = useState('What tools does your team use? Let us know in the comments below!');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateCaption({ topic, platform, tone, keyPoints, callToAction: cta });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
          ✍️ AI Multi-Platform Caption Studio
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Write platform-optimized copy with perfect line breaks, tone matching, and emojis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Core Topic / Headline Concept</label>
          <input
            type="text"
            className="input-control"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Social Channel</label>
          <select className="select-control" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="linkedin">💼 LinkedIn (Deep-Dive Professional)</option>
            <option value="twitter">🐦 X / Twitter (Thread Format)</option>
            <option value="instagram">📸 Instagram (Visual Caption)</option>
            <option value="tiktok">🎵 TikTok (Short Hook)</option>
            <option value="facebook">📘 Facebook (Community Post)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Tone & Brand Voice</label>
          <select className="select-control" value={tone} onChange={(e) => setTone(e.target.value)}>
            {AI_TEMPLATES.tones.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Key Bullets / Talking Points (Optional)</label>
          <textarea
            className="textarea-control"
            rows={3}
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Call To Action (CTA)</label>
          <input
            type="text"
            className="input-control"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ marginBottom: '28px' }}>
        {loading ? <Wand2 size={18} className="pulse-glow" /> : <Sparkles size={18} />}
        {loading ? 'Crafting Caption...' : 'Generate Optimized Caption'}
      </button>

      {/* Generated Result */}
      {result && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-glow" style={{ textTransform: 'uppercase' }}>{platform}</span>
              <span className="badge badge-cyan">{tone} Tone</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onCreatePostWithCaption({ title: topic, caption: result.caption, platform, hashtags: result.hashtags })}>
                Save to Calendar <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ whiteSpace: 'pre-line', fontSize: '0.92rem', color: '#fff', lineHeight: 1.6, background: 'rgba(8, 11, 17, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {result.caption}
          </div>
        </div>
      )}
    </div>
  );
}
