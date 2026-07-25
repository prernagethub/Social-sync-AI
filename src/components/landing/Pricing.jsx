import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Pricing({ onOpenAuth, onLaunchApp }) {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Starter Creator',
      priceMonthly: '$29',
      priceYearly: '$24',
      badge: null,
      desc: 'Ideal for solo creators & micro-influencers.',
      features: [
        '5 Social Channels (LinkedIn, X, IG)',
        '100 AI Generated Posts / mo',
        'Visual Content Calendar',
        'Basic Engagement Predictor',
        'Single User Access'
      ],
      btnClass: 'btn-secondary'
    },
    {
      name: 'Pro Team',
      priceMonthly: '$79',
      priceYearly: '$64',
      badge: 'MOST POPULAR',
      desc: 'Perfect for fast-growing brands & marketing teams.',
      features: [
        '15 Social Channels (All Platforms)',
        'Unlimited AI Content Generation',
        'Full AI Engagement Predictor Suite',
        'Team Approval & Commenting Workflow',
        '5 Team Seats Included',
        'Hashtag Competitive Research'
      ],
      btnClass: 'btn-primary'
    },
    {
      name: 'Agency Enterprise',
      priceMonthly: '$199',
      priceYearly: '$159',
      badge: 'ENTERPRISE',
      desc: 'For digital agencies managing multi-brand client portfolios.',
      features: [
        'Unlimited Social Channels & Brands',
        'Unlimited Team Seats & Client Portals',
        'Custom Brand Voice AI Training',
        'Priority API & Gemini Key Support',
        'Dedicated Account Strategist',
        'White-Label Analytics Exports'
      ],
      btnClass: 'btn-cyan'
    }
  ];

  return (
    <section id="pricing" style={{ maxWidth: '1100px', margin: '80px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge badge-glow" style={{ marginBottom: '12px' }}>SIMPLE TRANSPARENT PRICING</span>
        <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginTop: '6px' }}>
          Choose the Perfect Plan for Your Team
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px' }}>
          Scale your social reach without blowing your marketing budget.
        </p>

        {/* Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(15, 22, 35, 0.9)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-color)', marginTop: '24px' }}>
          <button 
            style={{ padding: '8px 20px', borderRadius: '25px', border: 'none', background: billingCycle === 'monthly' ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly Billing
          </button>
          <button 
            style={{ padding: '8px 20px', borderRadius: '25px', border: 'none', background: billingCycle === 'yearly' ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {plans.map((p, i) => (
          <div key={i} className="glass-panel" style={{
            padding: '32px',
            borderRadius: '20px',
            position: 'relative',
            border: p.badge === 'MOST POPULAR' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
            boxShadow: p.badge === 'MOST POPULAR' ? 'var(--shadow-glow)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            {p.badge && (
              <div className="badge badge-glow" style={{ position: 'absolute', top: '-14px', right: '24px', background: 'var(--primary)', color: '#fff' }}>
                {p.badge}
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '6px' }}>{p.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{p.desc}</p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: '800' }}>
                  {billingCycle === 'monthly' ? p.priceMonthly : p.priceYearly}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ month</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {p.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    <Check size={16} color="#10b981" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className={`btn ${p.btnClass} btn-lg`} style={{ width: '100%' }} onClick={onLaunchApp}>
              Start 14-Day Free Trial <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
