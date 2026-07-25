import React, { useState } from 'react';
import { Wand2, Lightbulb, PenTool, Hash, TrendingUp, Sparkles } from 'lucide-react';
import IdeaGenerator from './IdeaGenerator';
import CaptionWriter from './CaptionWriter';
import HashtagResearch from './HashtagResearch';
import EngagementPredictor from './EngagementPredictor';

export default function AIStudio({ onCreatePostFromIdea, onCreatePostWithCaption }) {
  const [activeTab, setActiveTab] = useState('ideas');

  const tabs = [
    { id: 'ideas', label: 'Idea Generator', icon: <Lightbulb size={16} /> },
    { id: 'caption', label: 'Caption Studio', icon: <PenTool size={16} /> },
    { id: 'hashtags', label: 'Hashtag Density', icon: <Hash size={16} /> },
    { id: 'predictor', label: 'Engagement Predictor', icon: <TrendingUp size={16} /> }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary-glow)' }}>
            <Wand2 size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>SocialSync AI Content Suite</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Empower your brand with viral hooks, multi-platform captions, hashtag insights, and engagement scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="btn"
            style={{
              background: activeTab === t.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
              fontSize: '0.88rem'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Active Sub-Tool */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
        {activeTab === 'ideas' && <IdeaGenerator onCreatePostFromIdea={onCreatePostFromIdea} />}
        {activeTab === 'caption' && <CaptionWriter onCreatePostWithCaption={onCreatePostWithCaption} />}
        {activeTab === 'hashtags' && <HashtagResearch />}
        {activeTab === 'predictor' && <EngagementPredictor />}
      </div>
    </div>
  );
}
