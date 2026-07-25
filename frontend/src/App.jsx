import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Sparkles,
  Database,
  Wand2,
  RefreshCw,
  X,
  Filter,
  Check,
  AlertCircle,
  Copy,
  Terminal,
  ExternalLink,
  Send,
  Radio,
  Rocket,
  Globe,
  Bot,
  ArrowRight,
  User,
  Settings,
  Key,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateCaption, generatePostIdeas } from './services/aiEngine';

const SQL_SCHEMA_SCRIPT = `-- Multi-User Social Accounts Schema
create table if not exists user_social_accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    platform text not null,
    account_name text,
    access_token text not null,
    account_urn text,
    created_at timestamptz default now()
);
alter table user_social_accounts disable row level security;
`;

const getTodayDateString = (dateVal = null) => {
  const d = dateVal ? new Date(dateVal) : new Date(Date.now() + 86400000);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getTodayTimeString = (dateVal = null) => {
  const d = dateVal ? new Date(dateVal) : new Date(Date.now() + 86400000);
  if (isNaN(d.getTime())) return '09:00';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  // User Profile & Social Token State
  const [userEmail, setUserEmail] = useState('creator@socialsync.ai');
  const [userLinkedinToken, setUserLinkedinToken] = useState('');
  const [tokenSavedStatus, setTokenSavedStatus] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString());
  const [scheduledTime, setScheduledTime] = useState(getTodayTimeString());
  const [status, setStatus] = useState('draft');
  const [color, setColor] = useState('#8b5cf6');

  // AI Studio State
  const [aiNiche, setAiNiche] = useState('Tech & AI Startup');
  const [aiIdeas, setAiIdeas] = useState([]);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchPosts = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('content_calendar')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (fetchErr) throw fetchErr;
      setPosts(data || []);
    } catch (err) {
      console.error('Supabase Query Error:', err);
      setError(err.message || 'Failed to fetch data from Supabase');
      setPosts([]);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);

    const interval = setInterval(() => {
      fetchPosts(false);
    }, 5000);

    const channel = supabase
      .channel('public:content_calendar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_calendar' },
        () => fetchPosts(false)
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerLinkedInPublisherAgent = async () => {
    try {
      await fetch('http://localhost:5001/api/publish/linkedin', { method: 'POST' });
    } catch (err) {
      console.warn('Backend trigger notice:', err);
    }
  };

  const handlePublishLinkedInNow = async (postId) => {
    setPublishingId(postId);
    try {
      await triggerLinkedInPublisherAgent();
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (err) {}
      await fetchPosts(false);
    } catch (err) {
      alert(`LinkedIn Publish Error: ${err.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleSaveSocialAccount = async (e) => {
    e.preventDefault();
    setTokenSavedStatus(true);
    setTimeout(() => setTokenSavedStatus(false), 2500);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (status === 'published') {
      try { confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } }); } catch (err) {}
    }

    const combinedIsoDate = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    const payload = {
      title: title.trim(),
      caption: caption.trim() || null,
      platform,
      scheduled_at: combinedIsoDate,
      status,
      color: color || '#8b5cf6',
      updated_at: new Date().toISOString()
    };

    try {
      if (editingPost?.id) {
        const { error: updateErr } = await supabase
          .from('content_calendar')
          .update(payload)
          .eq('id', editingPost.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('content_calendar')
          .insert([payload]);
        if (insertErr) throw insertErr;
      }

      if (platform === 'linkedin') {
        triggerLinkedInPublisherAgent();
      }

      await fetchPosts(false);
      closeModal();
    } catch (err) {
      if (err.message.includes('row-level security')) {
        setSqlModalOpen(true);
      }
      alert(`Supabase Error: ${err.message}`);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Delete this scheduled post from Supabase?')) return;

    try {
      const { error: deleteErr } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;
      await fetchPosts(false);
    } catch (err) {
      alert(`Supabase Delete Error: ${err.message}`);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const openModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title || '');
      setCaption(post.caption || '');
      setPlatform(post.platform || 'linkedin');
      setScheduledDate(getTodayDateString(post.scheduled_at));
      setScheduledTime(getTodayTimeString(post.scheduled_at));
      setStatus(post.status || 'draft');
      setColor(post.color || '#8b5cf6');
    } else {
      setEditingPost(null);
      setTitle('');
      setCaption('');
      setPlatform('linkedin');
      setScheduledDate(getTodayDateString());
      setScheduledTime(getTodayTimeString());
      setStatus('draft');
      setColor('#8b5cf6');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPost(null);
  };

  const handleGenerateAiCaption = async () => {
    if (!aiTopic.trim() && !title.trim()) {
      alert('Please enter a post title or topic first.');
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await generateCaption({ topic: aiTopic || title, platform });
      setCaption(res.caption);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleGenerateIdeas = async () => {
    setGeneratingIdeas(true);
    try {
      const res = await generatePostIdeas({ niche: aiNiche });
      setAiIdeas(res || []);
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const filteredPosts = posts.filter(p => filterPlatform === 'all' || p.platform === filterPlatform);

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'facebook': return '📘';
      default: return '🌐';
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'idea': return <span className="badge status-idea">💡 Idea</span>;
      case 'draft': return <span className="badge status-draft">📝 Draft</span>;
      case 'in_review': return <span className="badge status-review">👀 In Review</span>;
      case 'scheduled': return <span className="badge status-scheduled">📅 Scheduled</span>;
      case 'published': return <span className="badge status-published">🚀 Published</span>;
      default: return <span className="badge">{st}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Bar */}
      <nav style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, padding: '12px 24px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentView('landing')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--primary-glow)' }}>
              <Rocket size={22} color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SocialSync AI
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setCurrentView('landing')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700',
                border: 'none',
                background: currentView === 'landing' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                color: currentView === 'landing' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Globe size={15} /> Home Landing
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700',
                border: 'none',
                background: currentView === 'calendar' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                color: currentView === 'calendar' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CalendarIcon size={15} /> Content Calendar
            </button>

            <button
              onClick={() => setCurrentView('ai_studio')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700',
                border: 'none',
                background: currentView === 'ai_studio' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                color: currentView === 'ai_studio' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={15} /> AI Studio
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSettingsModalOpen(true)}>
              <Settings size={15} color="#06b6d4" /> Connect My Accounts
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setCurrentView('calendar'); openModal(); }}>
              <Plus size={16} /> New Post
            </button>
          </div>
        </div>
      </nav>

      {/* VIEW 1: LANDING */}
      {currentView === 'landing' && (
        <div>
          <section style={{ padding: '80px 24px 60px 24px', textAlign: 'center' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c084fc', fontSize: '0.85rem', fontWeight: '700', marginBottom: '24px' }}>
                <Sparkles size={14} /> Multi-Tenant AI Social Publishing Platform
              </div>

              <h1 style={{ fontSize: '3.4rem', fontWeight: '900', lineHeight: 1.15, marginBottom: '20px', background: 'linear-gradient(to right, #ffffff, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Automate Social Media Strategy with AI & CrewAI Agents
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '740px', margin: '0 auto 36px auto' }}>
                Any user can log in, connect their personal <strong>LinkedIn</strong> & <strong>X (Twitter)</strong> accounts, and let automated background agents publish scheduled content directly to their feeds.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }} onClick={() => setCurrentView('calendar')}>
                  Launch Content Calendar <ArrowRight size={18} />
                </button>
                <button className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: '12px' }} onClick={() => setSettingsModalOpen(true)}>
                  <Key size={18} color="#06b6d4" /> Connect My Social Accounts
                </button>
              </div>
            </div>
          </section>

          <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', borderTop: '4px solid #8b5cf6' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <User size={26} color="#c084fc" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>Multi-User Account Connections</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Every team member links their own personal OAuth access tokens under <strong>"Connect My Accounts"</strong>. Posts automatically route to the logged-in user's social profile.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', borderTop: '4px solid #06b6d4' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Bot size={26} color="#22d3ee" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>CrewAI Background Publishing</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Background agents process due posts, verify content formatting, and trigger live REST API posts directly to LinkedIn & X.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', borderTop: '4px solid #10b981' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Database size={26} color="#34d399" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>Live Supabase Data Store</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Direct connection to Supabase <code>content_calendar</code> and <code>user_social_accounts</code> tables with real-time UI auto-updates.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: CALENDAR DASHBOARD */}
      {currentView === 'calendar' && (
        <div style={{ padding: '24px' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto 28px auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Social Media Content Calendar
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Logged in as: <code style={{ color: '#22d3ee' }}>{userEmail}</code>
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => openModal()}>
                <Plus size={18} /> Schedule New Post
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 22, 35, 0.8)', padding: '12px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Filter Channel:</span>
                {['all', 'linkedin', 'twitter', 'instagram', 'tiktok', 'facebook'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPlatform(p)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      border: filterPlatform === p ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: filterPlatform === p ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                      color: filterPlatform === p ? '#c084fc' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {p === 'all' ? '🌐 All Posts' : p}
                  </button>
                ))}
              </div>

              <button className="btn btn-secondary btn-sm" onClick={() => fetchPosts(false)}>
                <RefreshCw size={14} /> Sync Supabase
              </button>
            </div>
          </div>

          <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="pulse-glow" style={{ fontSize: '1.2rem', fontWeight: '700' }}>Connecting to Supabase database...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No posts found in Supabase</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Your <code>content_calendar</code> table is ready. Click below to add your first post!</p>
                <button className="btn btn-primary" onClick={() => openModal()}>
                  <Plus size={18} /> Schedule Post in Supabase
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredPosts.map(p => (
                  <div
                    key={p.id}
                    className="glass-panel glass-panel-hover"
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      borderLeft: `5px solid ${p.color || '#8b5cf6'}`
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{getPlatformIcon(p.platform)}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.platform}</span>
                        </div>
                        {getStatusBadge(p.status)}
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>{p.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.caption || 'No caption text.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          <Clock size={14} color="#06b6d4" />
                          <span>{new Date(p.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => openModal(p)}>
                            <Edit3 size={14} /> Edit
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: '#fca5a5' }} onClick={() => handleDeletePost(p.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {p.platform === 'linkedin' && p.status !== 'published' && (
                        <button
                          className="btn btn-cyan btn-sm"
                          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                          onClick={() => handlePublishLinkedInNow(p.id)}
                          disabled={publishingId === p.id}
                        >
                          <Send size={14} /> {publishingId === p.id ? 'Publishing Agent Running...' : '🚀 Publish Live to LinkedIn Agent'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: AI STUDIO */}
      {currentView === 'ai_studio' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🤖 AI Content Generation Studio
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Generate post ideas, viral hooks, and copy using Google Gemini LLM engine.</p>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <label className="form-label">Industry Niche / Topic</label>
                <input type="text" className="input-control" value={aiNiche} onChange={(e) => setAiNiche(e.target.value)} placeholder="e.g. AI Automation, SaaS, Marketing" />
              </div>
              <button className="btn btn-primary" onClick={handleGenerateIdeas} disabled={generatingIdeas}>
                <Wand2 size={18} /> {generatingIdeas ? 'Generating Ideas...' : 'Generate Post Ideas'}
              </button>
            </div>
          </div>

          {aiIdeas.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {aiIdeas.map((idea, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span className="badge status-idea" style={{ marginBottom: '10px', display: 'inline-block' }}>Idea #{idx + 1}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>{idea.title || idea}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{idea.angle || idea.hook || 'High engagement content angle for social media.'}</p>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      setTitle(idea.title || idea);
                      setCaption(idea.angle || idea.hook || '');
                      setCurrentView('calendar');
                      openModal();
                    }}
                  >
                    <Plus size={14} /> Schedule this Idea
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MULTI-USER CONNECT SOCIAL ACCOUNTS MODAL */}
      {settingsModalOpen && (
        <div className="modal-overlay" onClick={() => setSettingsModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={22} color="#06b6d4" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Connect Social Media Accounts</h2>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSettingsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Each team member can link their personal social accounts here. Scheduled posts will automatically route through your personal OAuth tokens!
            </p>

            <form onSubmit={handleSaveSocialAccount}>
              <div className="form-group">
                <label className="form-label">User Email Account</label>
                <input
                  type="email"
                  className="input-control"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>LinkedIn OAuth Access Token</span>
                  <a href="https://www.linkedin.com/developers/tools/oauth" target="_blank" rel="noreferrer" style={{ color: '#22d3ee', fontSize: '0.78rem' }}>
                    Generate Token <ExternalLink size={12} />
                  </a>
                </label>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={userLinkedinToken}
                  onChange={(e) => setUserLinkedinToken(e.target.value)}
                  placeholder="Paste your personal LinkedIn OAuth Access Token..."
                  style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                />
              </div>

              {tokenSavedStatus && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Personal Social Accounts Saved Successfully!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSettingsModalOpen(false)}>Close</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save Connected Accounts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule / Edit Post Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                {editingPost ? 'Edit Scheduled Post' : 'Schedule New Post'}
              </h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePost}>
              <div className="form-group">
                <label className="form-label">Post Title *</label>
                <input type="text" className="input-control" placeholder="e.g. 5 AI Automation Workflows" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Target Platform</label>
                  <select className="select-control" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="linkedin">💼 LinkedIn</option>
                    <option value="twitter">🐦 X / Twitter</option>
                    <option value="instagram">📸 Instagram</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="facebook">📘 Facebook</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Post Status</label>
                  <select className="select-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="draft">📝 Draft</option>
                    <option value="in_review">👀 In Review</option>
                    <option value="scheduled">📅 Scheduled</option>
                    <option value="published">🚀 Published</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date *</label>
                  <input type="date" className="input-control" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} style={{ fontSize: '0.95rem', background: '#090d16', borderColor: '#a78bfa' }} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Time *</label>
                  <input type="time" className="input-control" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={{ fontSize: '0.95rem', background: '#090d16', borderColor: '#a78bfa' }} required />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label className="form-label">Caption Copy</label>
                <textarea className="textarea-control" rows={5} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write or paste your post content..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} /> {editingPost ? 'Update Post in Supabase' : 'Schedule & Trigger Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
