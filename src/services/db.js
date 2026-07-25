// Database Service synced with Express REST API Server
import { api } from './api';

const STORAGE_KEYS = {
  POSTS: 'socialsync_posts_v1',
  WORKSPACES: 'socialsync_workspaces_v1',
  CURRENT_WORKSPACE: 'socialsync_current_ws_v1',
  COMMENTS: 'socialsync_comments_v1',
  API_KEYS: 'socialsync_apikeys_v1'
};

const SEED_WORKSPACES = [
  {
    id: 'ws-1',
    name: 'Acme SaaS Brand',
    logo: '🚀',
    role: 'Admin',
    members: [
      { id: 'usr-1', name: 'Alex Morgan', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { id: 'usr-2', name: 'Sarah Chen', role: 'Lead Editor', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
      { id: 'usr-3', name: 'David Miller', role: 'Social Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'ws-2',
    name: 'Growth Agency HQ',
    logo: '⚡',
    role: 'Editor',
    members: [
      { id: 'usr-1', name: 'Alex Morgan', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { id: 'usr-4', name: 'Elena Rostova', role: 'Copywriter', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' }
    ]
  }
];

class DatabaseService {
  constructor() {
    this.listeners = [];
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

  // Posts CRUD with async REST API sync
  getPosts(workspaceId) {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = raw ? JSON.parse(raw) : [];
    if (!workspaceId) return posts;
    return posts.filter(p => p.workspaceId === workspaceId);
  }

  async syncPosts(workspaceId) {
    try {
      const serverPosts = await api.getPosts(workspaceId);
      if (serverPosts && serverPosts.length > 0) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(serverPosts));
        this.notify();
        return serverPosts;
      }
    } catch (e) {}
    return this.getPosts(workspaceId);
  }

  async savePost(postData) {
    let saved;
    try {
      saved = await api.savePost(postData);
    } catch (e) {
      // Local fallback
      const posts = this.getPosts();
      if (postData.id) {
        saved = postData;
        const updated = posts.map(p => p.id === postData.id ? { ...p, ...postData } : p);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
      } else {
        saved = { ...postData, id: `post-${Date.now()}` };
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([saved, ...posts]));
      }
    }

    await this.syncPosts(postData.workspaceId || this.getCurrentWorkspaceId());
    this.notify();
    return saved;
  }

  async deletePost(id) {
    try {
      await api.deletePost(id);
    } catch (e) {}

    const posts = this.getPosts();
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
    this.notify();
  }

  // Workspaces
  getWorkspaces() {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    return raw ? JSON.parse(raw) : SEED_WORKSPACES;
  }

  getCurrentWorkspaceId() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_WORKSPACE) || 'ws-1';
  }

  setCurrentWorkspaceId(id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_WORKSPACE, id);
    this.notify();
  }

  getCurrentWorkspace() {
    const id = this.getCurrentWorkspaceId();
    const workspaces = this.getWorkspaces();
    return workspaces.find(w => w.id === id) || workspaces[0];
  }

  // Comments
  getComments(postId) {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments = raw ? JSON.parse(raw) : [];
    return comments.filter(c => c.postId === postId);
  }

  async addComment(postId, author, avatar, text) {
    let newComment;
    try {
      newComment = await api.addComment(postId, author, avatar, text);
    } catch (e) {
      newComment = {
        id: `c-${Date.now()}`,
        postId,
        author,
        avatar,
        text,
        createdAt: new Date().toISOString()
      };
    }

    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments = raw ? JSON.parse(raw) : [];
    const updated = [...comments, newComment];
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(updated));
    this.notify();
    return newComment;
  }

  getApiKey(service = 'gemini') {
    const keys = JSON.parse(localStorage.getItem(STORAGE_KEYS.API_KEYS) || '{}');
    return keys[service] || '';
  }

  setApiKey(service, key) {
    const keys = JSON.parse(localStorage.getItem(STORAGE_KEYS.API_KEYS) || '{}');
    keys[service] = key;
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
    this.notify();
  }
}

export const db = new DatabaseService();
