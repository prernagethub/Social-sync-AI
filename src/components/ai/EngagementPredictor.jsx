import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart3, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { predictEngagement } from '../../services/aiEngine';

export default function EngagementPredictor() {
  const [caption, setCaption] = useState(
    `AI is transforming how forward-thinking leaders approach social media content planning.\n\n` +
    `Here is what most teams get wrong:\n` +
    `❌ Relying on generic boilerplate text without brand tone\n` +
    `❌ Ignoring predictive engagement metrics prior to publishing\n` +
    `❌ Publishing without clear audience call-to-actions\n\n` +
    `What are your thoughts? Drop a comment below! 👇\n\n` +
    `#Leadership #Strategy #Innovation #Growth #Tech2026`
  );
  const [platform, setPlatform] = useState('linkedin');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const res = predictEngagement({ caption, platform, scheduledTime });
    setPrediction(res);
  }, [caption, platform, scheduledTime]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
          📈 AI Engagement Predictor
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Paste or write your draft text below to calculate live engagement quality scores and actionable suggestions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Input */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Platform Target</label>
              <select className="select-control" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="twitter">🐦 X / Twitter</option>
                <option value="instagram">📸 Instagram</option>
                <option value="tiktok">🎵 TikTok</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Publish Time</label>
              <input
                type="time"
                className="input-control"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Draft Content</label>
            <textarea
              className="textarea-control"
              rows={10}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write or paste your post content..."
            />
          </div>
        </div>

        {/* Right Live Score Card */}
        {prediction && (
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Predicted Score & Reach
                </span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: prediction.gradeColor, border: `1px solid ${prediction.gradeColor}` }}>
                  Grade {prediction.grade}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '3.6rem', fontWeight: '800', color: prediction.gradeColor, lineHeight: 1 }}>
                  {prediction.score}
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>/ 100</div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>
                    ~{prediction.estimatedReachMultiplier} Organic Reach
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-muted)' }}>
                ALGORITHM FEEDBACK BREAKDOWN:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {prediction.analysis.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${item.type === 'good' ? '#10b981' : '#f59e0b'}` }}>
                    {item.type === 'good' ? <CheckCircle2 size={16} color="#10b981" /> : <AlertCircle size={16} color="#f59e0b" />}
                    <span style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
