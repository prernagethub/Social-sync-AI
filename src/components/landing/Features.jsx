import React from 'react';
import { Calendar, Wand2, BarChart3, Users, Hash, Eye, Sparkles, Clock, CheckCircle } from 'lucide-react';

export default function Features() {
  const featureList = [
    {
      icon: <Wand2 size={26} color="#8b5cf6" />,
      title: 'AI Idea & Caption Generator',
      desc: 'Never suffer from writer block again. Instantly generate tailored campaign hooks, post concepts, and platform-formatted copy.'
    },
    {
      icon: <Calendar size={26} color="#06b6d4" />,
      title: 'Interactive Visual Calendar',
      desc: 'Drag-and-drop posts across Month, Week, or Day views. Filter by social channel, approval status, or campaign tags.'
    },
    {
      icon: <BarChart3 size={26} color="#10b981" />,
      title: 'AI Engagement Predictor',
      desc: 'Our predictive algorithm rates your hooks, readability, line breaks, and hashtags to give a 0-100 score before you hit publish.'
    },
    {
      icon: <Eye size={26} color="#ec4899" />,
      title: 'Multi-Platform Pixel Preview',
      desc: 'Inspect exactly how your content appears natively on LinkedIn, X/Twitter, Instagram feed/reels, and TikTok overlays.'
    },
    {
      icon: <Users size={26} color="#f59e0b" />,
      title: 'Team Approval Workflow',
      desc: 'Collaborate seamlessly with clients and team members. Comment directly on post drafts, assign roles, and log approvals.'
    },
    {
      icon: <Hash size={26} color="#3b82f6" />,
      title: 'Hashtag Density Optimizer',
      desc: 'Discover high-reach, medium-competition, and niche hashtags automatically grouped for maximum organic discovery.'
    }
  ];

  return (
    <section id="features" style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>POWERFUL CAPABILITIES</span>
        <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginTop: '8px' }}>
          Everything You Need to Scale Social Media
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '12px auto 0 auto' }}>
          Built specifically for growth marketers, agencies, and high-velocity creators.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {featureList.map((f, i) => (
          <div key={i} className="glass-panel glass-panel-hover" style={{ padding: '28px', borderRadius: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid var(--border-color)'
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>{f.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
