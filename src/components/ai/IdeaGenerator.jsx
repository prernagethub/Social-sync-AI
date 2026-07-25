import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, PlusCircle, Check } from 'lucide-react';
import { AI_TEMPLATES, generatePostIdeas } from '../../services/aiEngine';

export default function IdeaGenerator({ onCreatePostFromIdea }) {
  const [niche, setNiche] = useState('SaaS & Tech Startup');
  const [goal, setGoal] = useState('Brand Awareness & Reach');
  const [audience, setAudience] = useState('Founders, Marketing Leaders & Engineers');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const results = await generatePostIdeas({ niche, goal, targetAudience: audience });
      setIdeas(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
          💡 AI Post Idea & Campaign Generator
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Brainstorm viral hooks, educational breakdowns, and promotional concepts tailored to your niche.
        </p>
      </div>

      {/* Input Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label">Industry / Brand Niche</label>
          <select className="select-control" value={niche} onChange={(e) => setNiche(e.target.value)}>
            {AI_TEMPLATES.nicheOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Campaign Objective</label>
          <select className="select-control" value={goal} onChange={(e) => setGoal(e.target.value)}>
            {AI_TEMPLATES.goals.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Target Audience Persona</label>
          <input
            type="text"
            className="input-control"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. Founders & Marketing Leaders"
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ marginBottom: '28px' }}>
        {loading ? <Wand2 size={18} className="pulse-glow" /> : <Sparkles size={18} />}
        {loading ? 'Brainstorming Concepts...' : 'Generate 5 Post Concepts'}
      </button>

      {/* Ideas Results */}
      {ideas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ideas.map((idea) => (
            <div key={idea.id} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-cyan">{idea.category}</span>
                  <span className="badge badge-glow" style={{ textTransform: 'capitalize' }}>Suggested: {idea.suggestedPlatform}</span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>{idea.predictedReach}</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  {idea.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Angle: {idea.angle}
                </p>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={() => onCreatePostFromIdea(idea)}>
                <PlusCircle size={16} color="#8b5cf6" /> Turn Into Draft
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
