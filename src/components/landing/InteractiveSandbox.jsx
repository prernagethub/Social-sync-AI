import React, { useState } from 'react';
import { Sparkles, Play, CheckCircle2, ArrowRight, Wand2, BarChart2 } from 'lucide-react';
import { generateCaption, predictEngagement } from '../../services/aiEngine';

export default function InteractiveSandbox({ onLaunchApp }) {
  const [topic, setTopic] = useState('5 AI Tools that save 10 hours a week for creators');
  const [platform, setPlatform] = useState('linkedin');
  const [tone, setTone] = useState('punchy');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateCaption({ topic, platform, tone });
      const prediction = predictEngagement({ caption: res.caption, platform, hashtags: res.hashtags });
      setOutput({ ...res, prediction });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="sandbox" style={{ maxWidth: '1100px', margin: '80px auto 40px auto', padding: '0 20px' }}>
      <div className="glass-panel" style={{ padding: '36px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative Background Glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge badge-glow" style={{ marginBottom: '12px' }}>INTERACTIVE AI SANDBOX</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '6px' }}>
            Test the AI Content Studio Live
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select your social platform and topic to see immediate post generation & engagement scoring.
          </p>
        </div>

        {/* Form Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Post Topic / Hook Concept</label>
            <input 
              type="text" 
              className="input-control" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 3 Growth strategies for 2026"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Social Platform</label>
            <select className="select-control" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="linkedin">💼 LinkedIn (Professional Deep-Dive)</option>
              <option value="twitter">🐦 X / Twitter (Punchy Thread)</option>
              <option value="instagram">📸 Instagram (Visual Caption + Emojis)</option>
              <option value="tiktok">🎵 TikTok (Viral Video Hook)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Brand Tone & Voice</label>
            <select className="select-control" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="punchy">⚡ Punchy & Direct</option>
              <option value="professional">👔 Professional & Authoritative</option>
              <option value="storytelling">📖 Storytelling & Emotional</option>
              <option value="viral">🔥 Viral & Controversial</option>
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleGenerate} 
            disabled={loading}
            style={{ minWidth: '220px' }}
          >
            {loading ? <Wand2 size={20} className="pulse-glow" /> : <Sparkles size={20} />}
            {loading ? 'Generating Content...' : 'Generate Post & Score'}
          </button>
        </div>

        {/* Output Preview */}
        {output && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px', animation: 'fadeIn 0.3s ease-in' }}>
            {/* Generated Text */}
            <div style={{ background: 'rgba(8, 11, 17, 0.9)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Generated Caption ({platform.toUpperCase()})
                </span>
                <span className="badge badge-cyan">AI Generated</span>
              </div>
              <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                {output.caption}
              </div>
            </div>

            {/* Engagement Score Meter */}
            <div style={{ background: 'rgba(8, 11, 17, 0.9)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    AI Engagement Predictor
                  </span>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: output.prediction.gradeColor, border: `1px solid ${output.prediction.gradeColor}` }}>
                    Grade {output.prediction.grade}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: output.prediction.gradeColor }}>
                    {output.prediction.score}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ 100 Engagement Score</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {output.prediction.analysis.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: item.type === 'good' ? '#34d399' : '#fcd34d' }}>
                      <span>{item.type === 'good' ? '✓' : '⚠️'}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-cyan btn-sm" onClick={onLaunchApp} style={{ width: '100%', marginTop: '12px' }}>
                Schedule This Post in Calendar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
