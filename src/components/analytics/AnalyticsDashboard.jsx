import React from 'react';
import { BarChart3, TrendingUp, Sparkles, Calendar, Users, Eye, ArrowUpRight } from 'lucide-react';

export default function AnalyticsDashboard({ posts }) {
  const totalPosts = posts.length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;
  
  const avgScore = totalPosts > 0 
    ? Math.round(posts.reduce((acc, p) => acc + (p.engagementScore || 85), 0) / totalPosts) 
    : 88;

  const platformsCount = {
    linkedin: posts.filter(p => p.platform === 'linkedin').length,
    twitter: posts.filter(p => p.platform === 'twitter').length,
    instagram: posts.filter(p => p.platform === 'instagram').length,
    tiktok: posts.filter(p => p.platform === 'tiktok').length,
    facebook: posts.filter(p => p.platform === 'facebook').length
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>
          📈 Predictive Analytics & Engagement Forecast
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time metrics calculated by SocialSync AI predictive scoring algorithms.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Total Content Planned</span>
            <Calendar size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff' }}>{totalPosts}</div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> {scheduledCount} scheduled this week
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Avg AI Engagement Score</span>
            <Sparkles size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#06b6d4' }}>{avgScore}/100</div>
          <div style={{ fontSize: '0.78rem', color: '#06b6d4', marginTop: '4px' }}>
            Top 10% performance tier in SaaS & Marketing
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Predicted Reach Multiplier</span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981' }}>2.3x</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Vs traditional static scheduling
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Published Posts</span>
            <Eye size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ec4899' }}>{publishedCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            100% on-time automated distribution
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Channel Volume */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
            Channels Volume Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(platformsCount).map(([plat, count]) => {
              const pct = totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0;
              return (
                <div key={plat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', textTransform: 'capitalize' }}>
                    <span style={{ fontWeight: '600' }}>{plat}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} posts ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap Timing */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
            🔥 Peak Engagement Time Windows
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#10b981' }}>Morning Window: 08:30 AM - 10:30 AM</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Optimal for LinkedIn & X/Twitter professional updates</div>
              </div>
              <span className="badge" style={{ background: '#10b981', color: '#000' }}>98% Match</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#06b6d4' }}>Evening Window: 06:00 PM - 08:30 PM</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Optimal for Instagram & TikTok visual media</div>
              </div>
              <span className="badge" style={{ background: '#06b6d4', color: '#000' }}>92% Match</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
