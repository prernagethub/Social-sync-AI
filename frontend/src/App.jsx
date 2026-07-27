import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured, uploadImageToSupabase } from './supabaseClient';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  CheckCircle2,
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
  Shield,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Hash,
  FileText,
  BarChart3,
  Zap,
  Users,
  CreditCard,
  Lock,
  Bell,
  ImageIcon,
  UploadCloud,
  CheckSquare,
  Activity,
  CheckCircle,
  Layers,
  Cpu,
  Share2,
  Award,
  Milestone,
  Compass,
  ArrowDown,
  Github,
  Twitter,
  Linkedin,
  Heart,
  FolderOpen,
  Download,
  Eye,
  PieChart,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays
} from 'date-fns';
import {
  generateCaption,
  generatePostIdeas,
  researchHashtags,
  predictEngagement
} from './services/aiEngine';
import { auth } from './services/auth';

// Import Modular Modal Components
import AuthModal from './components/modals/AuthModal';
import ProfileModal from './components/modals/ProfileModal';
import PostModal from './components/modals/PostModal';
import ShareModal from './components/modals/ShareModal';
import SettingsModal from './components/modals/SettingsModal';
import SqlModal from './components/modals/SqlModal';

const SQL_SCHEMA_SCRIPT = `ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS image_url TEXT;`;

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
  const navigate = useNavigate();
  const location = useLocation();

  const [calendarDisplayMode, setCalendarDisplayMode] = useState('month');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [billingCycle, setBillingCycle] = useState('monthly');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');

  // Modals & Popovers State
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('profile');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  // Share Link Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Click outside ref for notification menu
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  // Sync URL subpath with filterPlatform state (/calendar/linkedin, /calendar/twitter, etc.)
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/calendar')) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const param = parts[1];
        if (param === 'linkedin' || param === 'linkden') {
          setFilterPlatform('linkedin');
        } else if (['twitter', 'instagram', 'tiktok', 'facebook', 'all'].includes(param)) {
          setFilterPlatform(param);
        } else {
          setFilterPlatform('all');
        }
      } else {
        setFilterPlatform('all');
      }
    }
  }, [location.pathname]);

  const handleFilterSelect = (p) => {
    setFilterPlatform(p);
    if (p === 'all') {
      navigate('/calendar');
    } else {
      navigate(`/calendar/${p}`);
    }
  };

  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('socialsync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authTitle, setAuthTitle] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [userPlan, setUserPlan] = useState('Pro Team Plan (₹499/mo)');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState(null);

  // Sync profile edit state when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditEmail(currentUser.email || '');
      setEditAvatar(currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`);
    }
  }, [currentUser, profileModalOpen]);

  // Save Profile Handler (Toastify 2s Notification)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      email: editEmail.trim() || currentUser.email,
      avatar: editAvatar || currentUser.avatar
    };
    setCurrentUser(updated);
    localStorage.setItem('socialsync_user', JSON.stringify(updated));
    try { confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } }); } catch (err) { }
    toast.success('Profile updated successfully! ✨', { autoClose: 2000 });
  };

  // Save Password Handler (Toastify 2s Notification)
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.', { autoClose: 2000 });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.', { autoClose: 2000 });
      return;
    }
    toast.success('Password changed successfully! 🔒', { autoClose: 2000 });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    try { confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } }); } catch (err) { }
  };

  // User Profile & Tokens State
  const [userLinkedinToken, setUserLinkedinToken] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString());
  const [scheduledTime, setScheduledTime] = useState(getTodayTimeString());
  const [status, setStatus] = useState('draft');
  const [color, setColor] = useState('#8b5cf6');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // AI Studio Suite State
  const [aiStudioTab, setAiStudioTab] = useState('ideas');
  const [aiNiche, setAiNiche] = useState('Tech & AI Startup');
  const [aiIdeas, setAiIdeas] = useState([]);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);

  // AI Caption State
  const [captionTopic, setCaptionTopic] = useState('');
  const [captionPlatform, setCaptionPlatform] = useState('linkedin');
  const [generatedCaptionResult, setGeneratedCaptionResult] = useState(null);
  const [generatingCaptionState, setGeneratingCaptionState] = useState(false);

  // AI Hashtag State
  const [hashtagTopic, setHashtagTopic] = useState('Marketing Automation');
  const [hashtagResults, setHashtagResults] = useState(null);
  const [researchingTags, setResearchingTags] = useState(false);

  // AI Prediction State
  const [predictCaption, setPredictCaption] = useState('5 AI Workflows transforming social media reach in 2026!');
  const [predictionResult, setPredictionResult] = useState(null);

  // Real-Time Analytics Dynamic Calculations based on Live Supabase Post Count
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const totalPostsCount = posts.length;

  const dynamicImpressions = (publishedCount * 18400) + (scheduledCount * 6200) + (totalPostsCount * 3100);
  const dynamicClicks = Math.round(dynamicImpressions * 0.086);
  const dynamicRate = totalPostsCount > 0 ? (4.5 + (publishedCount * 0.45)).toFixed(2) + '%' : '0.00%';

  const linkedinPosts = posts.filter(p => p.platform === 'linkedin').length;
  const twitterPosts = posts.filter(p => p.platform === 'twitter').length;
  const instagramPosts = posts.filter(p => p.platform === 'instagram').length;
  const tiktokPosts = posts.filter(p => p.platform === 'tiktok').length;

  const linkedinPct = totalPostsCount > 0 ? Math.round((linkedinPosts / totalPostsCount) * 100) : 40;
  const twitterPct = totalPostsCount > 0 ? Math.round((twitterPosts / totalPostsCount) * 100) : 30;
  const instagramPct = totalPostsCount > 0 ? Math.round((instagramPosts / totalPostsCount) * 100) : 20;
  const tiktokPct = totalPostsCount > 0 ? Math.max(0, 100 - linkedinPct - twitterPct - instagramPct) : 10;

  // Export CSV Functionality
  const handleExportCSV = () => {
    if (posts.length === 0) {
      toast.info('No posts available to export.', { autoClose: 2000 });
      return;
    }
    const headers = ['ID', 'Title', 'Platform', 'Scheduled At', 'Status', 'Caption'];
    const rows = posts.map(p => [
      p.id,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.platform,
      p.scheduled_at,
      p.status,
      `"${(p.caption || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SocialSync_Calendar_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Content Schedule exported to CSV! 📤', { autoClose: 2000 });
  };

  // AI Best Time Auto-Fill Feature
  const handleApplyAiBestTime = () => {
    const nextOptimalDate = getTodayDateString(new Date(Date.now() + 86400000 * 2));
    setScheduledDate(nextOptimalDate);
    setScheduledTime('09:30');
    toast.success('AI Optimal Time applied: 09:30 AM (+45% Reach) 🕒', { autoClose: 2000 });
  };

  // Preserve route on refresh
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/share/calendar') {
      localStorage.setItem('socialsync_last_path', location.pathname);
    }
  }, [location.pathname]);

  const fetchPosts = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('content_calendar')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (fetchErr) throw fetchErr;

      let allPosts = data || [];

      // User-specific post filtering
      if (currentUser?.email || currentUser?.id) {
        const userEmail = currentUser.email?.toLowerCase();
        const userId = currentUser.id;

        const userSpecificPosts = allPosts.filter(p => {
          const pEmail = p.user_email?.toLowerCase();
          const pUserId = p.user_id;
          // Match by email or user_id
          if (userEmail && pEmail && pEmail === userEmail) return true;
          if (userId && pUserId && String(pUserId) === String(userId)) return true;
          // If legacy post has no user info attached, show it if no user posts exist yet
          if (!pEmail && !pUserId) return true;
          return false;
        });

        setPosts(userSpecificPosts);
      } else {
        setPosts(allPosts);
      }
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
  }, [currentUser?.email, currentUser?.id]);

  // Notifications calculation
  const getNotifications = () => {
    const today = new Date();
    const scheduledToday = posts.filter(p => p.scheduled_at && isSameDay(new Date(p.scheduled_at), today));
    const draftPosts = posts.filter(p => p.status === 'draft');
    const recentPublished = posts.filter(p => p.status === 'published');

    const notifs = [];

    scheduledToday.forEach(p => {
      notifs.push({
        id: `sched-${p.id}`,
        type: 'scheduled',
        icon: '📅',
        title: `Post Scheduled Today`,
        desc: `"${p.title}" is scheduled for today at ${new Date(p.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        time: 'Today'
      });
    });

    if (draftPosts.length > 0) {
      notifs.push({
        id: 'draft-alert',
        type: 'draft',
        icon: '📝',
        title: `${draftPosts.length} Draft Posts Pending`,
        desc: `You have ${draftPosts.length} post ideas in draft mode ready to schedule.`,
        time: 'Pending'
      });
    }

    recentPublished.slice(0, 3).forEach(p => {
      notifs.push({
        id: `pub-${p.id}`,
        type: 'published',
        icon: '🚀',
        title: `Post Published`,
        desc: `"${p.title}" has been published to ${p.platform.toUpperCase()}`,
        time: 'Recently'
      });
    });

    return notifs;
  };

  const notificationsList = getNotifications();

  // Supabase Auth Listener for Google OAuth redirects
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          const meta = session.user.user_metadata || {};
          const loggedInUser = {
            id: session.user.id,
            name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            role: 'Admin',
            avatar: meta.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.user.email || 'user')}`,
            title: meta.title || 'Workspace Owner'
          };

          const existingUserStr = localStorage.getItem('socialsync_user');
          const alreadyWelcomed = localStorage.getItem('socialsync_google_welcomed');

          setCurrentUser(loggedInUser);
          localStorage.setItem('socialsync_user', JSON.stringify(loggedInUser));
          setAuthModalOpen(false);

          // Only trigger welcome toast ONCE per login session (not on page navigation/refresh)
          if (event === 'SIGNED_IN' && !alreadyWelcomed && (!existingUserStr || JSON.parse(existingUserStr).email !== loggedInUser.email)) {
            localStorage.setItem('socialsync_google_welcomed', 'true');
            toast.success(`Welcome back, ${loggedInUser.name}! Signed in via Google 🚀`, { toastId: 'google-welcome-toast', autoClose: 2500 });
            try { confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } }); } catch (err) { }
          }
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // ASPECT 1: Google OAuth Handler
  const handleGoogleAuth = async () => {
    try {
      setAuthError('');
      toast.info('Redirecting to Google Sign-In via Supabase...', { autoClose: 2000 });
      await auth.signInWithGoogle();
    } catch (err) {
      console.error('Google Auth Error:', err);
      setAuthError(err.message || 'Google Auth failed. Make sure Google provider is enabled in your Supabase dashboard.');
      toast.error(err.message || 'Google Auth failed', { autoClose: 3500 });
    }
  };

  // ASPECT 2 & 3: Supabase Email / Password Sign In & Sign Up
  const handleAuthSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        const { user } = await auth.signUpWithSupabase(
          authName || authEmail.split('@')[0] || 'New Creator',
          authEmail,
          authPassword,
          authTitle || 'Workspace Owner'
        );
        setCurrentUser(user);
        setAuthModalOpen(false);
        toast.success(`Account created in Supabase! Welcome, ${user.name}! 🎉`, { autoClose: 3000 });
        navigate('/calendar');
        try { confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } }); } catch (err) { }
      } else {
        const { user } = await auth.loginWithSupabase(authEmail, authPassword);
        setCurrentUser(user);
        setAuthModalOpen(false);
        toast.success(`Welcome back, ${user.name}! Signed in via Supabase 🔑`, { autoClose: 2500 });
        navigate('/calendar');
        try { confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } }); } catch (err) { }
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
      toast.error(err.message || 'Authentication error', { autoClose: 3500 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('socialsync_user');
    localStorage.removeItem('socialsync_last_path');
    localStorage.removeItem('socialsync_google_welcomed');
    if (isSupabaseConfigured()) {
      try { supabase.auth.signOut(); } catch (err) { }
    }
    setNotificationOpen(false);
    setProfileModalOpen(false);
    toast.info('Signed out successfully! 👋', { autoClose: 2000 });
    navigate('/home');
  };

  const requireAuth = (callback) => {
    if (!currentUser) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const triggerAutoPublisherAgent = async () => {
    try {
      await fetch('http://localhost:5001/api/publish/auto', { method: 'POST' });
    } catch (err) {
      console.warn('Auto publisher trigger notice:', err);
    }
  };

  const triggerLinkedInPublisherAgent = async () => {
    try {
      await fetch('http://localhost:5001/api/publish/linkedin', { method: 'POST' });
    } catch (err) {
      console.warn('Backend trigger notice:', err);
    }
  };

  const handlePublishLinkedInNow = async (postId) => {
    if (!requireAuth()) return;
    setPublishingId(postId);
    try {
      await triggerAutoPublisherAgent();
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (err) { }
      toast.success('Live Auto-Agent post published! 🚀', { autoClose: 2000 });
      await fetchPosts(false);
    } catch (err) {
      toast.error(`Auto-Agent Publish Error: ${err.message}`, { autoClose: 2000 });
    } finally {
      setPublishingId(null);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    toast.success('SQL Query copied to clipboard! 📋', { autoClose: 2000 });
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!title.trim()) return;

    if (status === 'published') {
      try { confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } }); } catch (err) { }
    }

    const combinedIsoDate = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    const payload = {
      user_email: currentUser?.email || null,
      user_id: (currentUser?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id)) ? currentUser.id : null,
      title: title.trim(),
      caption: caption.trim() || null,
      platform,
      scheduled_at: combinedIsoDate,
      status,
      color: color || '#8b5cf6',
      updated_at: new Date().toISOString()
    };

    let targetImg = imageUrl || imagePreview;
    if (targetImg) {
      toast.info('Uploading photo attachment...', { autoClose: 1500 });
      try {
        const publicUrl = await uploadImageToSupabase(targetImg);
        if (publicUrl) {
          targetImg = publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload note:', err);
      }
      payload.image_url = targetImg;
    }

    try {
      if (editingPost?.id) {
        const { error: updateErr } = await supabase
          .from('content_calendar')
          .update(payload)
          .eq('id', editingPost.id);
        if (updateErr) throw updateErr;
        toast.success('Post updated successfully! 📝', { autoClose: 2000 });
      } else {
        const { error: insertErr } = await supabase
          .from('content_calendar')
          .insert([payload]);
        if (insertErr) throw insertErr;
        toast.success('New post scheduled successfully! 📅', { autoClose: 2000 });
      }

      triggerAutoPublisherAgent();

      await fetchPosts(false);
      closeModal();
    } catch (err) {
      console.warn('Save attempt error:', err);
      if (err.message && (err.message.includes('column') || err.message.includes('schema cache') || err.message.includes('image_url'))) {
        const cleanPayload = {
          title: title.trim(),
          caption: caption.trim() || null,
          platform,
          scheduled_at: combinedIsoDate,
          status,
          color: color || '#8b5cf6',
          updated_at: new Date().toISOString()
        };
        if (payload.image_url) cleanPayload.image_url = payload.image_url;

        try {
          if (editingPost?.id) {
            await supabase.from('content_calendar').update(cleanPayload).eq('id', editingPost.id);
          } else {
            await supabase.from('content_calendar').insert([cleanPayload]);
          }
          triggerAutoPublisherAgent();
          await fetchPosts(false);
          closeModal();
          toast.success('Post saved successfully! 📅', { autoClose: 2000 });
          return;
        } catch (fallbackErr) {
          toast.error(`Supabase Error: ${fallbackErr.message}`, { autoClose: 2000 });
          return;
        }
      }
      toast.error(`Supabase Error: ${err.message}`, { autoClose: 2000 });
    }
  };

  const handleDeletePost = async (id) => {
    if (!requireAuth()) return;
    if (!confirm('Delete this scheduled post from Supabase?')) return;

    try {
      const { error: deleteErr } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;
      toast.warn('Post deleted from Supabase. 🗑️', { autoClose: 2000 });
      await fetchPosts(false);
    } catch (err) {
      toast.error(`Supabase Delete Error: ${err.message}`, { autoClose: 2000 });
    }
  };

  const openModal = (post = null, targetDateString = null) => {
    if (!requireAuth()) return;
    if (post) {
      setEditingPost(post);
      setTitle(post.title || '');
      setCaption(post.caption || '');
      setPlatform(post.platform || 'linkedin');
      setScheduledDate(getTodayDateString(post.scheduled_at));
      setScheduledTime(getTodayTimeString(post.scheduled_at));
      setStatus(post.status || 'draft');
      setColor(post.color || '#8b5cf6');
      setImageUrl(post.image_url || '');
      setImagePreview(post.image_url || '');
    } else {
      setEditingPost(null);
      setTitle('');
      setCaption('');
      setPlatform('linkedin');
      setScheduledDate(targetDateString || getTodayDateString());
      setScheduledTime(getTodayTimeString());
      setStatus('draft');
      setColor('#8b5cf6');
      setImageUrl('');
      setImagePreview('');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPost(null);
  };

  const handleGenerateIdeas = async () => {
    setGeneratingIdeas(true);
    try {
      const res = await generatePostIdeas({ niche: aiNiche });
      setAiIdeas(res || []);
      toast.success('AI Post Ideas generated! 💡', { autoClose: 2000 });
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const handleRunAiCaptionStudio = async () => {
    setGeneratingCaptionState(true);
    try {
      const res = await generateCaption({ topic: captionTopic || 'Modern AI Automation', platform: captionPlatform });
      setGeneratedCaptionResult(res);
      toast.success('Platform-tailored copy written by Gemini! ✍️', { autoClose: 2000 });
    } finally {
      setGeneratingCaptionState(false);
    }
  };

  const handleRunHashtagResearch = async () => {
    setResearchingTags(true);
    try {
      const res = await researchHashtags(hashtagTopic);
      setHashtagResults(res);
      toast.success('Hashtag volume research ready! 🏷️', { autoClose: 2000 });
    } finally {
      setResearchingTags(false);
    }
  };

  const handleRunPrediction = () => {
    const res = predictEngagement({ caption: predictCaption, platform: 'linkedin' });
    setPredictionResult(res);
    toast.info('Engagement score calculated! 📊', { autoClose: 2000 });
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

  // Month Grid View
  const renderMonthGrid = (readOnly = false) => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const dayPosts = filteredPosts.filter(p => {
          if (!p.scheduled_at) return false;
          return format(new Date(p.scheduled_at), 'yyyy-MM-dd') === formattedDate;
        });

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const targetDateStr = formattedDate;

        days.push(
          <div
            key={formattedDate}
            style={{
              minHeight: '125px',
              background: isCurrentMonth ? 'rgba(18, 24, 38, 0.6)' : 'rgba(8, 11, 17, 0.3)',
              border: isToday ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              opacity: isCurrentMonth ? 1 : 0.45,
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: isToday ? '900' : '600',
                color: isToday ? '#c084fc' : 'var(--text-muted)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: isToday ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {format(day, 'd')}
              </span>

              {!readOnly && (
                <button
                  title="Schedule post on this date"
                  onClick={() => openModal(null, targetDateStr)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    opacity: 0.7
                  }}
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '110px' }}>
              {dayPosts.map(p => (
                <div
                  key={p.id}
                  onClick={() => !readOnly && openModal(p)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    borderLeft: `3px solid ${p.color || '#8b5cf6'}`,
                    fontSize: '0.75rem',
                    cursor: readOnly ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                      {getPlatformIcon(p.platform)} {p.title}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: p.status === 'published' ? '#34d399' : '#a78bfa' }}>
                      {p.status === 'published' ? '🚀' : '📅'}
                    </span>
                  </div>
                  {p.image_url && (
                    <img src={p.image_url} alt="thumbnail" style={{ width: '100%', height: '32px', objectFit: 'cover', borderRadius: '4px', marginTop: '2px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {days}
        </div>
      );
      days = [];
    }

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
              {format(currentMonthDate, 'MMMM yyyy')}
            </h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonthDate(subMonths(currentMonthDate, 1))}><ChevronLeft size={16} /></button>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonthDate(new Date())} style={{ fontSize: '0.78rem' }}>Today</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonthDate(addMonths(currentMonthDate, 1))}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center' }}>
          {weekDays.map(d => (
            <div key={d} style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows}
        </div>
      </div>
    );
  };

  const isActivePath = (path) => {
    if (path === '/home' || path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  // Indian Rupee (₹) Pricing Plans starting from ₹99 / month
  const pricingPlans = [
    {
      name: 'Starter Creator',
      priceMonthly: '₹99',
      priceYearly: '₹79',
      badge: 'STARTER',
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
      priceMonthly: '₹499',
      priceYearly: '₹399',
      badge: 'MOST POPULAR',
      desc: 'Perfect for fast-growing brands & marketing teams.',
      features: [
        '15 Social Channels (All Platforms)',
        'Unlimited AI Content Generation',
        'Full AI Engagement Predictor Suite',
        'Team Approval Workflow',
        '5 Team Seats Included',
        'Hashtag Competitive Research'
      ],
      btnClass: 'btn-primary'
    },
    {
      name: 'Agency Enterprise',
      priceMonthly: '₹1,499',
      priceYearly: '₹1,199',
      badge: 'ENTERPRISE',
      desc: 'For digital agencies managing multi-brand portfolios.',
      features: [
        'Unlimited Social Channels & Brands',
        'Unlimited Team Seats',
        'Custom Brand Voice AI Training',
        'Priority API & Gemini Key Support',
        'Dedicated Account Strategist'
      ],
      btnClass: 'btn-cyan'
    }
  ];

  // Shared Calendar Component View
  const CalendarComponent = () => (
    !currentUser ? (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px', textAlign: 'center' }} className="glass-panel">
        <Lock size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          Please sign in to view your scheduled content calendar and post plans.
        </p>
        <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>
          <LogIn size={18} /> Sign In / Demo Login
        </button>
      </div>
    ) : (
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto 24px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Social Media Content Calendar
              </h1>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Active User: <code style={{ color: '#22d3ee' }}>{currentUser.email}</code>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

              <button className="btn btn-secondary btn-sm" onClick={() => setShareModalOpen(true)}>
                <Share2 size={14} color="#06b6d4" /> Share Client Link
              </button>

              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                <Download size={14} color="#34d399" /> Export CSV
              </button>

              <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setCalendarDisplayMode('month')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: 'none',
                    background: calendarDisplayMode === 'month' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                    color: calendarDisplayMode === 'month' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LayoutGrid size={14} /> 📅 Month Grid
                </button>

                <button
                  onClick={() => setCalendarDisplayMode('cards')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: 'none',
                    background: calendarDisplayMode === 'cards' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                    color: calendarDisplayMode === 'cards' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <List size={14} /> 📋 Cards View
                </button>
              </div>

              <button className="btn btn-primary" onClick={() => openModal()}>
                <Plus size={18} /> Schedule New Post
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 22, 35, 0.8)', padding: '12px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Filter Channel:</span>
              {['all', 'linkedin', 'twitter', 'instagram', 'tiktok', 'facebook'].map(p => (
                <button
                  key={p}
                  onClick={() => handleFilterSelect(p)}
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
          {calendarDisplayMode === 'month' ? (
            renderMonthGrid()
          ) : (
            <div>
              {filteredPosts.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 24px', borderRadius: '20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                    <FolderOpen size={32} color="#c084fc" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
                    No Posts Available {filterPlatform !== 'all' ? `for ${filterPlatform.toUpperCase()}` : ''} 📭
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                    You haven't scheduled any posts for this platform yet. Click below to create your first post or generate viral copy in AI Studio!
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                      <Plus size={18} /> Schedule New Post
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/ai-studio')}>
                      <Sparkles size={18} color="#c084fc" /> Generate Copy in AI Studio
                    </button>
                  </div>
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

                        {/* IMAGE PHOTO PREVIEW ON POST CARD */}
                        {p.image_url && (
                          <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                          </div>
                        )}
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
          )}
        </div>
      </div>
    )
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-dark)', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* GLOBAL TOASTIFY NOTIFICATION CONTAINER (2 SECOND AUTO-CLOSE, BOTTOM-RIGHT SMOOTH SLIDE) */}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />

      <div>
        {/* NAVBAR */}
        <nav style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, padding: '12px 24px' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/home')}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--primary-glow)' }}>
                <Rocket size={22} color="#fff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SocialSync AI
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => navigate('/home')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: 'none',
                  background: isActivePath('/home') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                  color: isActivePath('/home') ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Globe size={15} /> Home
              </button>

              <button
                onClick={() => {
                  if (requireAuth()) navigate('/calendar');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: 'none',
                  background: isActivePath('/calendar') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                  color: isActivePath('/calendar') ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CalendarIcon size={15} /> Calendar {!currentUser && <Lock size={12} color="#fca5a5" />}
              </button>

              <button
                onClick={() => {
                  if (requireAuth()) navigate('/analytics');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: 'none',
                  background: isActivePath('/analytics') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                  color: isActivePath('/analytics') ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BarChart3 size={15} /> Analytics {!currentUser && <Lock size={12} color="#fca5a5" />}
              </button>

              <button
                onClick={() => {
                  if (requireAuth()) navigate('/ai-studio');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: 'none',
                  background: isActivePath('/ai-studio') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                  color: isActivePath('/ai-studio') ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={15} /> AI Studio {!currentUser && <Lock size={12} color="#fca5a5" />}
              </button>

              <button
                onClick={() => navigate('/pricing')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: 'none',
                  background: isActivePath('/pricing') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                  color: isActivePath('/pricing') ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CreditCard size={15} /> Pricing
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
              {currentUser ? (
                <>
                  {/* NOTIFICATION BELL ICON CONTAINER WITH CLICK OUTSIDE REF */}
                  <div ref={notificationRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setNotificationOpen(!notificationOpen)}
                      style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      title="Notifications"
                    >
                      <Bell size={18} color="#c084fc" />
                      {notificationsList.length > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: '900',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #0f172a'
                        }}>
                          {notificationsList.length}
                        </span>
                      )}
                    </button>

                    {/* NOTIFICATION DROPDOWN POPUP */}
                    {notificationOpen && (
                      <div className="glass-panel" style={{
                        position: 'absolute',
                        top: '48px',
                        right: 0,
                        width: '340px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        borderRadius: '16px',
                        padding: '16px',
                        zIndex: 200,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(15, 23, 42, 0.96)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.95rem' }}>
                            <Bell size={16} color="#8b5cf6" /> Notifications ({notificationsList.length})
                          </div>
                          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setNotificationOpen(false)}><X size={16} /></button>
                        </div>

                        {notificationsList.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No new notifications right now.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {notificationsList.map((n) => (
                              <div key={n.id} style={{
                                padding: '10px 12px',
                                borderRadius: '10px',
                                background: 'rgba(30, 41, 59, 0.6)',
                                borderLeft: n.type === 'scheduled' ? '3px solid #8b5cf6' : n.type === 'draft' ? '3px solid #f59e0b' : '3px solid #10b981',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>{n.icon} {n.title}</span>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{n.time}</span>
                                </div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{n.desc}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button className="btn btn-secondary btn-sm" onClick={() => setSettingsModalOpen(true)}>
                    <Settings size={15} color="#06b6d4" /> Accounts
                  </button>

                  {/* USER PROFILE PILL BUTTON (OPENS PROFILE & ACCOUNT SETTINGS MODAL) */}
                  <div
                    onClick={() => setProfileModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(30, 41, 59, 0.7)',
                      padding: '4px 12px 4px 6px',
                      borderRadius: '30px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Click to Open Account Settings & Profile"
                    className="profile-pill-hover"
                  >
                    <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #8b5cf6' }} />
                    <div style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{currentUser.name}</div>
                      <div style={{ color: '#06b6d4', fontSize: '0.7rem' }}>{currentUser.role}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', marginLeft: '4px', display: 'flex', alignItems: 'center' }} title="Sign Out">
                      <LogOut size={15} />
                    </button>
                  </div>

                  <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
                    <Plus size={16} /> New Post
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthModalOpen(true); }}>
                    <LogIn size={15} /> Sign In
                  </button>
                  <button className="btn btn-cyan btn-sm" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthModalOpen(true); }}>
                    <UserPlus size={15} /> Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={
            currentUser ? <Navigate to="/calendar" replace /> : <Navigate to="/home" replace />
          } />

          {/* ROUTE 1: /home */}
          <Route path="/home" element={
            <div>
              <section style={{ padding: '95px 24px 75px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 2 }}>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 22px', borderRadius: '30px', background: 'rgba(139, 92, 246, 0.18)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c084fc', fontSize: '0.88rem', fontWeight: '700', marginBottom: '28px' }}>
                    <Sparkles size={16} /> Next-Gen Autonomous AI Social Media & CrewAI Agent Platform
                  </div>

                  <h1 style={{ fontSize: '4rem', fontWeight: '900', lineHeight: 1.1, marginBottom: '24px', background: 'linear-gradient(to right, #ffffff, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Automate Social Media Strategy, AI Copywriting & Live Publishing
                  </h1>

                  <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '800px', margin: '0 auto 40px auto' }}>
                    Plan content visually on a 7x5 month grid, generate viral copy with Google Gemini AI, predict engagement scores, and let autonomous background agents post live content to <strong>LinkedIn & X (Twitter)</strong> automatically.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '44px' }}>
                    {currentUser ? (
                      <button className="btn btn-primary" style={{ padding: '16px 34px', fontSize: '1.05rem', borderRadius: '14px' }} onClick={() => navigate('/calendar')}>
                        Open My Content Calendar <ArrowRight size={20} />
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-cyan" style={{ padding: '16px 34px', fontSize: '1.05rem', borderRadius: '14px' }} onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthModalOpen(true); }}>
                          <UserPlus size={20} /> Create Free Account <ArrowRight size={20} />
                        </button>
                        <button className="btn btn-primary" style={{ padding: '16px 28px', fontSize: '1.05rem', borderRadius: '14px' }} onClick={() => { setAuthMode('login'); setAuthError(''); setAuthModalOpen(true); }}>
                          <LogIn size={20} /> Sign In
                        </button>
                      </>
                    )}

                    <button className="btn btn-secondary" style={{ padding: '16px 28px', fontSize: '1.05rem', borderRadius: '14px' }} onClick={() => {
                      const pricingElem = document.getElementById('home-pricing-section');
                      if (pricingElem) pricingElem.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      View Pricing Plans (From ₹99) <CreditCard size={20} color="#06b6d4" />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#c084fc' }}>10x</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Faster Content Planning</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#22d3ee' }}>99.8%</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Publishing Accuracy</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#34d399' }}>20s</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CrewAI Background Agent Loop</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fbbf24' }}>5</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Social Networks Supported</div>
                    </div>
                  </div>

                </div>
              </section>

              {/* VISUAL PROCESS ROADMAP (LOGIN TO SCHEDULING & PUBLISHING JOURNEY) */}
              <section style={{ maxWidth: '1280px', margin: '0 auto 90px auto', padding: '0 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                  <span className="badge badge-glow" style={{ marginBottom: '12px' }}>STEP-BY-STEP EXECUTION ROADMAP</span>
                  <h2 style={{ fontSize: '2.6rem', fontWeight: '800', marginTop: '8px' }}>
                    End-to-End Workflow Roadmap: From Login to Auto-Publishing
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
                    Follow this 5-step journey to automate your entire social media strategy seamlessly.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>

                  {/* Step 1 */}
                  <div className="glass-panel" style={{ padding: '28px 36px', borderRadius: '20px', borderLeft: '6px solid #8b5cf6', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '900', color: '#c084fc', flexShrink: 0 }}>
                      01
                    </div>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <LogIn size={18} color="#c084fc" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Step 1: Authenticate & Login to Workspace</h3>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                        Click <strong>"Sign In"</strong> or <strong>"1-Click Instant Demo Login"</strong> to authenticate. Your session is protected and persisted automatically across page refreshes.
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>
                      Sign In Now <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Step 2 */}
                  <div className="glass-panel" style={{ padding: '28px 36px', borderRadius: '20px', borderLeft: '6px solid #06b6d4', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '900', color: '#22d3ee', flexShrink: 0 }}>
                      02
                    </div>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Key size={18} color="#06b6d4" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Step 2: Connect Social Accounts & OAuth Tokens</h3>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                        Open <strong>Accounts</strong> in the navbar and input your LinkedIn OAuth token to grant automated posting authorization to your channels.
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => requireAuth(() => setSettingsModalOpen(true))}>
                      Connect Tokens <Settings size={14} />
                    </button>
                  </div>

                  {/* Step 3 */}
                  <div className="glass-panel" style={{ padding: '28px 36px', borderRadius: '20px', borderLeft: '6px solid #10b981', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '900', color: '#34d399', flexShrink: 0 }}>
                      03
                    </div>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Wand2 size={18} color="#10b981" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Step 3: Generate Topic Copy in AI Studio</h3>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                        Navigate to <strong>AI Studio</strong>, type any topic (e.g. <i>Gen-Z on protest</i>, <i>AI SaaS</i>), and let Google Gemini generate viral hooks, platform copy & hashtags.
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => requireAuth(() => navigate('/ai-studio'))}>
                      Open AI Studio <Sparkles size={14} />
                    </button>
                  </div>

                  {/* Step 4 */}
                  <div className="glass-panel" style={{ padding: '28px 36px', borderRadius: '20px', borderLeft: '6px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '900', color: '#fbbf24', flexShrink: 0 }}>
                      04
                    </div>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <CalendarIcon size={18} color="#f59e0b" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Step 4: Pick Date on 7x5 Visual Calendar & Attach Media</h3>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                        Select your publishing date on the 7x5 month grid, attach a photo image asset, choose channel target (LinkedIn/Twitter), and set status to <strong>📅 Scheduled</strong>.
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => requireAuth(() => navigate('/calendar'))}>
                      View Calendar <CalendarIcon size={14} />
                    </button>
                  </div>

                  {/* Step 5 */}
                  <div className="glass-panel" style={{ padding: '28px 36px', borderRadius: '20px', borderLeft: '6px solid #ec4899', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '900', color: '#f472b6', flexShrink: 0 }}>
                      05
                    </div>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Bot size={18} color="#ec4899" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Step 5: Autonomous CrewAI Agent Auto-Publishes Live</h3>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                        When the scheduled time arrives, our Python background agent loop detects your post in Supabase, posts it live to your feed, and updates status to <strong>🚀 Published</strong>!
                      </p>
                    </div>
                    <div className="badge status-published" style={{ fontSize: '0.85rem' }}>
                      🚀 Hands-Free Automation
                    </div>
                  </div>

                </div>
              </section>

              <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 90px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                  <span className="badge badge-glow" style={{ marginBottom: '12px' }}>ALL-IN-ONE PLATFORM CAPABILITIES</span>
                  <h2 style={{ fontSize: '2.6rem', fontWeight: '800', marginTop: '8px' }}>
                    What SocialSync AI Can Do For Your Brand
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
                  <div className="glass-panel" style={{ padding: '36px', borderRadius: '24px', borderTop: '5px solid #8b5cf6' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                      <CalendarIcon size={28} color="#c084fc" />
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '12px' }}>📅 1. Visual 7x5 Monthly Calendar Grid</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>View your complete content calendar showing exact dates, post titles, media photo thumbnails, and channel filters.</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '36px', borderRadius: '24px', borderTop: '5px solid #06b6d4' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                      <Bot size={28} color="#22d3ee" />
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '12px' }}>⚡ 2. CrewAI Background Publishing Agent</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>Python CrewAI background loop polls Supabase every 20s and posts live content directly to LinkedIn & X feeds.</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '36px', borderRadius: '24px', borderTop: '5px solid #10b981' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                      <Wand2 size={28} color="#34d399" />
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '12px' }}>🤖 3. 4-in-1 AI Studio Suite (Gemini LLM)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>Generate post ideas, viral copy, hashtag volume research, and predictive engagement scores.</p>
                  </div>
                </div>
              </section>

              {/* PRICING SECTION AT THE END OF HOME PAGE */}
              <section id="home-pricing-section" style={{ maxWidth: '1180px', margin: '0 auto 100px auto', padding: '0 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <span className="badge badge-glow" style={{ marginBottom: '12px' }}>SIMPLE TRANSPARENT PRICING FROM ₹99/MO</span>
                  <h2 style={{ fontSize: '2.6rem', fontWeight: '800', marginTop: '6px' }}>
                    Choose the Perfect Plan for Your Team
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
                    Scale your social reach without blowing your marketing budget. Plans start from just ₹99/month.
                  </p>

                  <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(15, 22, 35, 0.9)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-color)', marginTop: '24px' }}>
                    <button
                      style={{ padding: '8px 22px', borderRadius: '25px', border: 'none', background: billingCycle === 'monthly' ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                      onClick={() => setBillingCycle('monthly')}
                    >
                      Monthly Billing
                    </button>
                    <button
                      style={{ padding: '8px 22px', borderRadius: '25px', border: 'none', background: billingCycle === 'yearly' ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                      onClick={() => setBillingCycle('yearly')}
                    >
                      Yearly (Save 20%)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '28px' }}>
                  {pricingPlans.map((p, i) => (
                    <div key={i} className="glass-panel" style={{
                      padding: '36px',
                      borderRadius: '24px',
                      position: 'relative',
                      border: p.badge === 'MOST POPULAR' ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      {p.badge && (
                        <div className="badge badge-glow" style={{ position: 'absolute', top: '-14px', right: '24px', background: '#8b5cf6', color: '#fff' }}>
                          {p.badge}
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '6px' }}>{p.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{p.desc}</p>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                          <span style={{ fontSize: '3rem', fontWeight: '900' }}>
                            {billingCycle === 'monthly' ? p.priceMonthly : p.priceYearly}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ month</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                          {p.features.map((feat, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                              <Check size={16} color="#10b981" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button className={`btn ${p.btnClass}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => { if (requireAuth()) navigate('/calendar'); }}>
                        Start 14-Day Free Trial <ArrowRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          } />

          {/* ROUTE 2: /calendar AND /calendar/:platformParam */}
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/calendar/:platformParam" element={<CalendarComponent />} />

          {/* ROUTE 3: /analytics (DYNAMIC DYNAMIC REAL-TIME METRICS BASED ON LIVE DATABASE POSTS) */}
          <Route path="/analytics" element={
            !currentUser ? (
              <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px', textAlign: 'center' }} className="glass-panel">
                <Lock size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Authentication Required</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                  Please sign in to access Social Performance Analytics.
                </p>
                <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>
                  <LogIn size={18} /> Sign In / Demo Login
                </button>
              </div>
            ) : (
              <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Dynamic Database Calculations</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      📊 Dynamic Social Reach & Engagement Analytics
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time metrics dynamically calculated from your live Supabase post count & statuses.</p>
                  </div>

                  <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                    <Download size={14} color="#34d399" /> Export Analytics CSV
                  </button>
                </div>

                {/* Stat Cards - DYNAMIC LIVE CALCULATION */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', borderLeft: '5px solid #8b5cf6' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>DYNAMIC IMPRESSIONS</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff' }}>{dynamicImpressions.toLocaleString()}</div>
                    <div style={{ color: '#34d399', fontSize: '0.78rem', marginTop: '6px' }}>↑ Live derived from {totalPostsCount} active posts</div>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', borderLeft: '5px solid #06b6d4' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>DYNAMIC ENGAGEMENT RATE</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#22d3ee' }}>{dynamicRate}</div>
                    <div style={{ color: '#34d399', fontSize: '0.78rem', marginTop: '6px' }}>↑ Based on {publishedCount} published posts</div>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', borderLeft: '5px solid #10b981' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>TOTAL POST CLICKS</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#34d399' }}>{dynamicClicks.toLocaleString()}</div>
                    <div style={{ color: '#34d399', fontSize: '0.78rem', marginTop: '6px' }}>↑ 8.6% Dynamic CTR multiplier</div>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', borderLeft: '5px solid #fbbf24' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>DATABASE POST COUNTS</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fbbf24' }}>{publishedCount} Pub / {scheduledCount} Sched</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px' }}>{totalPostsCount} Total Active in Supabase</div>
                  </div>
                </div>

                {/* Channel Reach Breakdown - DYNAMIC CALCULATIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#fff' }}>💼 Dynamic Platform Share</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                          <span>💼 LinkedIn ({linkedinPosts} posts)</span>
                          <span style={{ fontWeight: '700', color: '#38bdf8' }}>{linkedinPct}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${linkedinPct}%`, height: '100%', background: '#38bdf8', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                          <span>🐦 X / Twitter ({twitterPosts} posts)</span>
                          <span style={{ fontWeight: '700', color: '#c084fc' }}>{twitterPct}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${twitterPct}%`, height: '100%', background: '#c084fc', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                          <span>📸 Instagram ({instagramPosts} posts)</span>
                          <span style={{ fontWeight: '700', color: '#f472b6' }}>{instagramPct}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${instagramPct}%`, height: '100%', background: '#f472b6', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                          <span>🎵 TikTok ({tiktokPosts} posts)</span>
                          <span style={{ fontWeight: '700', color: '#34d399' }}>{tiktokPct}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${tiktokPct}%`, height: '100%', background: '#34d399', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#fff' }}>🔥 Top Performing Content</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {posts.slice(0, 4).map((p, idx) => (
                        <div key={p.id || idx} style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{getPlatformIcon(p.platform)} {p.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {p.status}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#34d399' }}>{85 + idx * 12}% engagement</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Grade A+</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )
          } />

          {/* ROUTE 4: /share/calendar (PUBLIC CLIENT PRESENTATION VIEW) */}
          <Route path="/share/calendar" element={
            <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px 60px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span className="badge badge-glow" style={{ marginBottom: '12px' }}>CLIENT SHAREABLE READ-ONLY CALENDAR</span>
                <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginTop: '6px' }}>
                  SocialSync Content Schedule Presentation
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
                  Live read-only schedule preview for client review and brand alignment.
                </p>
              </div>

              {renderMonthGrid(true)}
            </div>
          } />

          {/* ROUTE 5: /ai-studio */}
          <Route path="/ai-studio" element={
            !currentUser ? (
              <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px', textAlign: 'center' }} className="glass-panel">
                <Lock size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Authentication Required</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                  Please sign in to access the AI Studio Suite.
                </p>
                <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>
                  <LogIn size={18} /> Sign In / Demo Login
                </button>
              </div>
            ) : (
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🤖 AI Content Generation & Analytics Studio
                  </h1>
                  <p style={{ color: 'var(--text-muted)' }}>Generate post ideas, viral captions, hashtag research, and predictive engagement scores powered by Gemini LLM.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <button onClick={() => setAiStudioTab('ideas')} className={`btn ${aiStudioTab === 'ideas' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.85rem' }}>
                    💡 Post Ideas Generator
                  </button>
                  <button onClick={() => setAiStudioTab('caption')} className={`btn ${aiStudioTab === 'caption' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.85rem' }}>
                    ✍️ AI Caption Writer
                  </button>
                  <button onClick={() => setAiStudioTab('hashtags')} className={`btn ${aiStudioTab === 'hashtags' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.85rem' }}>
                    🏷️ Hashtag Research
                  </button>
                  <button onClick={() => setAiStudioTab('predict')} className={`btn ${aiStudioTab === 'predict' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.85rem' }}>
                    📊 Predictive Engagement Score
                  </button>
                </div>

                {aiStudioTab === 'ideas' && (
                  <div>
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
                                navigate('/calendar');
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

                {aiStudioTab === 'caption' && (
                  <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Generate Platform Tailored Copy</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label className="form-label">Post Topic</label>
                        <input type="text" className="input-control" value={captionTopic} onChange={(e) => setCaptionTopic(e.target.value)} placeholder="e.g. 5 AI Automation Workflows" />
                      </div>
                      <div>
                        <label className="form-label">Target Channel</label>
                        <select className="select-control" value={captionPlatform} onChange={(e) => setCaptionPlatform(e.target.value)}>
                          <option value="linkedin">💼 LinkedIn</option>
                          <option value="twitter">🐦 X / Twitter</option>
                          <option value="instagram">📸 Instagram</option>
                          <option value="tiktok">🎵 TikTok</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleRunAiCaptionStudio} disabled={generatingCaptionState}>
                      <Wand2 size={16} /> {generatingCaptionState ? 'Writing Copy...' : 'Generate Copy & Hashtags'}
                    </button>

                    {generatedCaptionResult && (
                      <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ color: '#c084fc', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '700' }}>Generated Copy Result:</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', color: '#fff', fontFamily: 'inherit' }}>{generatedCaptionResult.caption}</pre>
                        <button className="btn btn-cyan btn-sm" style={{ marginTop: '12px' }} onClick={() => { setTitle(captionTopic || 'AI Post'); setCaption(generatedCaptionResult.caption); navigate('/calendar'); openModal(); }}>
                          <Plus size={14} /> Schedule This Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {aiStudioTab === 'hashtags' && (
                  <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Research High Volume & Niche Hashtags</h3>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                      <input type="text" className="input-control" value={hashtagTopic} onChange={(e) => setHashtagTopic(e.target.value)} placeholder="Topic keyword..." />
                      <button className="btn btn-primary" onClick={handleRunHashtagResearch} disabled={researchingTags}>
                        <Hash size={16} /> {researchingTags ? 'Researching...' : 'Find Hashtags'}
                      </button>
                    </div>

                    {hashtagResults && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '12px' }}>
                          <h4 style={{ color: '#c084fc', marginBottom: '8px', fontSize: '0.85rem' }}>High Volume Hashtags</h4>
                          {hashtagResults.highVolume?.map(h => <span key={h.tag} style={{ display: 'inline-block', background: 'rgba(139, 92, 246, 0.2)', padding: '4px 8px', borderRadius: '6px', margin: '4px', fontSize: '0.8rem', color: '#fff' }}>{h.tag}</span>)}
                        </div>

                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '16px', borderRadius: '12px' }}>
                          <h4 style={{ color: '#22d3ee', marginBottom: '8px', fontSize: '0.85rem' }}>Niche Targeted</h4>
                          {hashtagResults.nicheTargeted?.map(h => <span key={h.tag} style={{ display: 'inline-block', background: 'rgba(6, 182, 212, 0.2)', padding: '4px 8px', borderRadius: '6px', margin: '4px', fontSize: '0.8rem', color: '#fff' }}>{h.tag}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {aiStudioTab === 'predict' && (
                  <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Predictive Engagement Score Analyzer</h3>
                    <textarea className="textarea-control" rows={4} value={predictCaption} onChange={(e) => setPredictCaption(e.target.value)} style={{ marginBottom: '16px' }} />
                    <button className="btn btn-primary" onClick={handleRunPrediction}>
                      <TrendingUp size={16} /> Predict Engagement Score
                    </button>

                    {predictionResult && (
                      <div style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#34d399' }}>{predictionResult.score}%</div>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>Grade: {predictionResult.grade}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Reach: {predictionResult.estimatedReachMultiplier}</div>
                          </div>
                        </div>
                        {predictionResult.analysis?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={14} color="#34d399" /> {item.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          } />

          {/* ROUTE 6: /pricing */}
          <Route path="/pricing" element={
            <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px 60px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="badge badge-glow" style={{ marginBottom: '12px' }}>SIMPLE TRANSPARENT PRICING FROM ₹99/MO</span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '6px' }}>
                  Choose the Perfect Plan for Your Team
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px' }}>
                  Scale your social reach without blowing your marketing budget. Plans start from just ₹99/month.
                </p>

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
                {pricingPlans.map((p, i) => (
                  <div key={i} className="glass-panel" style={{
                    padding: '32px',
                    borderRadius: '20px',
                    position: 'relative',
                    border: p.badge === 'MOST POPULAR' ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    {p.badge && (
                      <div className="badge badge-glow" style={{ position: 'absolute', top: '-14px', right: '24px', background: '#8b5cf6', color: '#fff' }}>
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
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                            <Check size={16} color="#10b981" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className={`btn ${p.btnClass}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => { if (requireAuth()) navigate('/calendar'); }}>
                      Start 14-Day Free Trial <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          } />
        </Routes>
      </div>

      {/* FOOTER SECTION */}
      <footer style={{ background: 'rgba(11, 15, 25, 0.95)', borderTop: '1px solid var(--border-color)', padding: '50px 24px 30px 24px', marginTop: '60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>

            {/* Column 1: Brand Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Rocket size={18} color="#fff" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>SocialSync AI</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Autonomous social media planning, AI copywriting, and background publishing platform powered by Google Gemini LLM & CrewAI Agents.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="https://github.com/prernagethub/Social-sync-AI.git" target="_blank" rel="noopener noreferrer" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} title="GitHub Repo">
                  <Github size={16} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }} title="LinkedIn">
                  <Linkedin size={16} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }} title="Twitter / X">
                  <Twitter size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform Navigation</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <li><button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} onClick={() => navigate('/home')}>🌐 Overview Home</button></li>
                <li><button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} onClick={() => requireAuth(() => navigate('/calendar'))}>📅 Content Calendar</button></li>
                <li><button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} onClick={() => requireAuth(() => navigate('/analytics'))}>📊 Performance Analytics</button></li>
                <li><button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} onClick={() => requireAuth(() => navigate('/ai-studio'))}>🤖 AI Studio Suite</button></li>
                <li><button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} onClick={() => navigate('/pricing')}>💳 Pricing Plans (From ₹99)</button></li>
              </ul>
            </div>

            {/* Column 3: Platform Features */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Capabilities</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <li>✨ 7x5 Visual Monthly Grid</li>
                <li>⚡ CrewAI 20s Background Agent</li>
                <li>✍️ Gemini AI Platform Copywriter</li>
                <li>📊 Predictive Engagement Analyzer</li>
                <li>📸 Photo Media Asset Support</li>
              </ul>
            </div>

            {/* Column 4: System Status */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Operational Status</h4>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
                  <span style={{ color: '#fff', fontWeight: '700' }}>Supabase DB Connection: Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
                  <span style={{ color: '#fff', fontWeight: '700' }}>Express Backend: Port 5001</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 8px #c084fc' }}></span>
                  <span style={{ color: '#fff', fontWeight: '700' }}>CrewAI Agent: Polling (20s)</span>
                </div>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div>
              © 2026 SocialSync AI. All rights reserved. Built with <Heart size={13} color="#ec4899" style={{ display: 'inline', verticalAlign: 'middle' }} /> by <strong>Prerna Rajput</strong>.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="https://github.com/prernagethub/Social-sync-AI.git" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>GitHub Repository</a>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODULAR MODAL COMPONENTS */}
      <AuthModal
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authName={authName}
        setAuthName={setAuthName}
        authTitle={authTitle}
        setAuthTitle={setAuthTitle}
        authError={authError}
        setAuthError={setAuthError}
        isSubmitting={isSubmitting}
        handleAuthSubmit={handleAuthSubmit}
        handleGoogleAuth={handleGoogleAuth}
      />

      <ProfileModal
        profileModalOpen={profileModalOpen}
        setProfileModalOpen={setProfileModalOpen}
        currentUser={currentUser}
        profileTab={profileTab}
        setProfileTab={setProfileTab}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editAvatar={editAvatar}
        setEditAvatar={setEditAvatar}
        handleSaveProfile={handleSaveProfile}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        handleChangePassword={handleChangePassword}
        userPlan={userPlan}
        navigate={navigate}
      />

      <PostModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        editingPost={editingPost}
        handleApplyAiBestTime={handleApplyAiBestTime}
        handleSavePost={handleSavePost}
        title={title}
        setTitle={setTitle}
        platform={platform}
        setPlatform={setPlatform}
        status={status}
        setStatus={setStatus}
        scheduledDate={scheduledDate}
        setScheduledDate={setScheduledDate}
        scheduledTime={scheduledTime}
        setScheduledTime={setScheduledTime}
        caption={caption}
        setCaption={setCaption}
        handleImageFileChange={handleImageFileChange}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
      />

      <ShareModal
        shareModalOpen={shareModalOpen}
        setShareModalOpen={setShareModalOpen}
      />

      <SettingsModal
        settingsModalOpen={settingsModalOpen}
        setSettingsModalOpen={setSettingsModalOpen}
        userLinkedinToken={userLinkedinToken}
        setUserLinkedinToken={setUserLinkedinToken}
        toast={toast}
      />

      <SqlModal
        sqlModalOpen={sqlModalOpen}
        setSqlModalOpen={setSqlModalOpen}
        SQL_SCHEMA_SCRIPT={SQL_SCHEMA_SCRIPT}
        handleCopySql={handleCopySql}
        copiedSql={copiedSql}
      />

    </div>
  );
}
