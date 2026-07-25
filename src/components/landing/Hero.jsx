import React from 'react';
import { Sparkles, Calendar, Zap, TrendingUp, Users, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export default function Hero({ onOpenAuth, onLaunchApp, onDemoLogin }) {
  return (
    <section style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 20px 40px 20px',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Pill Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '24px' }}>
        <Sparkles size={16} color="#c084fc" />
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#c084fc' }}>
          SocialSync AI 2.0 is Live • Predictive Content Calendar
        </span>
      </div>

      {/* Main Title */}
      <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: '800', lineHeight: 1.1, marginBottom: '20px' }}>
        Plan, Generate & Dominate <br />
        <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Social Media with AI
        </span>
      </h1>

      <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
        The all-in-one collaborative workspace that generates post ideas, writes multi-platform captions, researches hashtags, visualizes scheduling, and predicts engagement before you publish.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <button className="btn btn-primary btn-lg" onClick={onLaunchApp}>
          Open App Workspace <ArrowRight size={18} />
        </button>
        <button className="btn btn-secondary btn-lg" onClick={onDemoLogin}>
          <Zap size={18} color="#f59e0b" /> Instant Demo Access
        </button>
      </div>

      {/* Feature Bullet Strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10b981" /> No Credit Card Required</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10b981" /> LinkedIn, X, IG, TikTok, FB</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10b981" /> Real-time Engagement Predictor</div>
      </div>

      {/* Mockup Dashboard Preview Window */}
      <div className="glass-panel" style={{
        borderRadius: '20px',
        padding: '16px',
        maxWidth: '1080px',
        margin: '0 auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        textAlign: 'left'
      }}>
        {/* Window Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            socialsync.app/workspace/acme-saas/calendar
          </div>
          <div className="badge badge-cyan">LIVE DEMO PREVIEW</div>
        </div>

        {/* Dashboard Preview Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {/* Card 1: Engagement Score */}
          <div style={{ background: 'rgba(11, 15, 25, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>AI Engagement Predictor</span>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981' }}>Grade A+</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981' }}>94/100</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Predicted 2.4x higher reach vs average LinkedIn posts in SaaS niche.
            </div>
          </div>

          {/* Card 2: Calendar Schedule */}
          <div style={{ background: 'rgba(11, 15, 25, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Upcoming Calendar Posts</span>
              <span className="badge badge-glow">3 Scheduled Today</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span className="platform-linkedin">💼 5 AI Tools Transforming Social...</span>
                <span className="status-scheduled badge" style={{ fontSize: '0.65rem' }}>10:00 AM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span className="platform-twitter">🐦 Thread: Scaling from 2 to 20...</span>
                <span className="status-scheduled badge" style={{ fontSize: '0.65rem' }}>02:30 PM</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Generation */}
          <div style={{ background: 'rgba(11, 15, 25, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Multi-Platform Repurposer</span>
              <Sparkles size={16} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontStyle: 'italic', background: 'rgba(6, 182, 212, 0.1)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #06b6d4' }}>
              "Auto-tailored 1 core blog post into LinkedIn slide deck, X thread, IG visual caption & TikTok hook!"
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
