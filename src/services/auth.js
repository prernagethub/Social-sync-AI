// Authentication & Session Management Service with Express API Backend integration
import { api } from './api';

const AUTH_KEY = 'socialsync_user_session_v1';

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
    this.init();
  }

  init() {
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

  getUser() {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  async login(email, password) {
    try {
      const res = await api.login(email, password);
      if (res && res.user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
        this.notify();
        return res.user;
      }
    } catch (e) {
      console.warn('Backend server offline, using local auth');
    }

    const fallback = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'Editor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      title: 'Content Creator'
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(fallback));
    this.notify();
    return fallback;
  }

  async demoLogin(userIndex = 0) {
    try {
      const res = await api.demoLogin(userIndex);
      if (res && res.user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
        this.notify();
        return res.user;
      }
    } catch (e) {}

    const user = DEFAULT_USERS[userIndex] || DEFAULT_USERS[0];
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  async signUp(name, email, password) {
    try {
      const res = await api.signUp(name, email, password);
      if (res && res.user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
        this.notify();
        return res.user;
      }
    } catch (e) {}

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      title: 'Workspace Owner'
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    this.notify();
    return newUser;
  }

  logout() {
    localStorage.removeItem(AUTH_KEY);
    this.notify();
  }
}

export const auth = new AuthService();
