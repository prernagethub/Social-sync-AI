import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import InteractiveSandbox from './InteractiveSandbox';
import Features from './Features';
import Pricing from './Pricing';
import { Sparkles, Heart } from 'lucide-react';

export default function LandingPage({ onOpenAuth, onLaunchApp, onDemoLogin, user }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar onOpenAuth={onOpenAuth} onLaunchApp={onLaunchApp} user={user} />
      <Hero onOpenAuth={onOpenAuth} onLaunchApp={onLaunchApp} onDemoLogin={onDemoLogin} />
      <InteractiveSandbox onLaunchApp={onLaunchApp} />
      <Features />
      <Pricing onOpenAuth={onOpenAuth} onLaunchApp={onLaunchApp} />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 20px', marginTop: '80px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="#8b5cf6" />
          <span style={{ fontWeight: '700', color: '#fff' }}>SocialSync AI</span>
          <span>— Collaborative Social Media Content Planning Studio</span>
        </div>
        <p style={{ marginTop: '8px' }}>
          Built with React, Vite, and AI Predictive Algorithms.
        </p>
      </footer>
    </div>
  );
}
