import { supabase, isSupabaseConfigured } from '../supabaseClient';

const AUTH_KEY = 'socialsync_user_session_v1';
const TOKEN_KEY = 'socialsync_jwt_token';

const DEFAULT_USERS = [
  {
    id: 'usr-1',
    name: 'Alex Morgan',
    email: 'alex@acmebrand.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    title: 'Head of Growth & AI Strategy'
  },
  {
    id: 'usr-2',
    name: 'Sarah Chen',
    email: 'sarah@acmebrand.com',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    title: 'Lead Content Strategist'
  }
];

class AuthService {
  constructor() {
    this.listeners = [];
    if (!localStorage.getItem(AUTH_KEY)) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_USERS[0]));
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb());
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser() {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  setUserSession(user, token = null) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  // Google OAuth via Supabase
  async signInWithGoogle() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } else {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file.');
    }
  }

  // Supabase Email & Password Sign Up
  async signUpWithSupabase(name, email, password, title = 'Workspace Owner') {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name || email.split('@')[0],
            title: title,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
          }
        }
      });
      if (error) throw error;

      const user = {
        id: data.user?.id || `usr-${Date.now()}`,
        name: name || data.user?.user_metadata?.name || email.split('@')[0],
        email: email,
        role: 'Admin',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        title: title
      };
      this.setUserSession(user, data.session?.access_token);
      return { user, session: data.session };
    }
    return this.signUp(name, email, password, title);
  }

  // Supabase Email & Password Sign In
  async loginWithSupabase(email, password) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('❌ Incorrect email or password. Please check your credentials.');
        }
        throw error;
      }

      const meta = data.user?.user_metadata || {};
      const user = {
        id: data.user?.id || `usr-${Date.now()}`,
        name: meta.name || meta.full_name || email.split('@')[0],
        email: email,
        role: 'Admin',
        avatar: meta.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        title: meta.title || 'Workspace Owner'
      };
      this.setUserSession(user, data.session?.access_token);
      return { user, session: data.session };
    }
    return this.login(email, password);
  }

  async verifyToken() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn('JWT verification offline fallback:', err.message);
    }
    return this.getUser();
  }

  async login(email, password) {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        const err = new Error(data.error || 'Failed to login');
        err.status = response.status;
        throw err;
      }
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
      this.notify();
      return { user: data.user, token: data.token };
    } catch (err) {
      if (err.status === 401 || err.status === 404 || err.status === 400) {
        throw err;
      }
      console.warn('Backend login API unavailable, using offline login mode:', err.message);
      const found = DEFAULT_USERS.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || {
        id: `usr-${Date.now()}`,
        name: (email || 'User').split('@')[0],
        email: email || 'user@example.com',
        role: 'Admin',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || 'user')}`,
        title: 'Content Creator'
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(found));
      this.notify();
      return { user: found, token: null };
    }
  }

  demoLogin(userIndex = 0) {
    const user = DEFAULT_USERS[userIndex] || DEFAULT_USERS[0];
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  async signUp(name, email, password, title = 'Workspace Owner', role = 'Admin') {
    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, title, role })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        const err = new Error(data.error || 'Failed to sign up');
        err.status = response.status;
        throw err;
      }
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
      this.notify();
      return { user: data.user, token: data.token };
    } catch (err) {
      if (err.status === 400 || err.status === 409 || (err.message && err.message.includes('already exists'))) {
        throw err;
      }
      console.warn('Backend signup API unavailable, creating offline fallback user:', err.message);
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name || email.split('@')[0],
        email: email,
        password: password,
        role: role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        title: title
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      this.notify();
      return { user: newUser, token: null };
    }
  }

  logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    if (isSupabaseConfigured()) {
      try { supabase.auth.signOut(); } catch (err) {}
    }
    this.notify();
  }
}

export const auth = new AuthService();
