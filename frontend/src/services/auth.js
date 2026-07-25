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

  login(email) {
    const found = DEFAULT_USERS.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || {
      id: `usr-${Date.now()}`,
      name: (email || 'User').split('@')[0],
      email: email || 'user@example.com',
      role: 'Editor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      title: 'Content Creator'
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(found));
    this.notify();
    return found;
  }

  demoLogin(userIndex = 0) {
    const user = DEFAULT_USERS[userIndex] || DEFAULT_USERS[0];
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  signUp(name, email) {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || 'Creator',
      email: email,
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
