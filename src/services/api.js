// Frontend REST API Client with Gemini LLM Header Pass-through
import { db } from './db';

const API_BASE = '/api';

function getAiHeaders() {
  const customKey = db.getApiKey('gemini');
  const headers = { 'Content-Type': 'application/json' };
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }
  return headers;
}

export const api = {
  // Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'OFFLINE' };
    }
  },

  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  async signUp(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return await res.json();
  },

  async demoLogin(userIndex = 0) {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIndex })
    });
    return await res.json();
  },

  // Workspaces
  async getWorkspaces() {
    try {
      const res = await fetch(`${API_BASE}/workspaces`);
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  // Posts
  async getPosts(workspaceId) {
    try {
      const url = workspaceId ? `${API_BASE}/posts?workspaceId=${workspaceId}` : `${API_BASE}/posts`;
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async savePost(postData) {
    if (postData.id) {
      const res = await fetch(`${API_BASE}/posts/${postData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return await res.json();
    } else {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return await res.json();
    }
  },

  async deletePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // Comments
  async getComments(postId) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async addComment(postId, author, avatar, text) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, avatar, text })
    });
    return await res.json();
  },

  // LLM AI Endpoints
  async generateIdeas(niche, goal, targetAudience) {
    const res = await fetch(`${API_BASE}/ai/ideas`, {
      method: 'POST',
      headers: getAiHeaders(),
      body: JSON.stringify({ niche, goal, targetAudience })
    });
    return await res.json();
  },

  async generateCaption(topic, platform, tone, keyPoints, callToAction) {
    const res = await fetch(`${API_BASE}/ai/caption`, {
      method: 'POST',
      headers: getAiHeaders(),
      body: JSON.stringify({ topic, platform, tone, keyPoints, callToAction })
    });
    return await res.json();
  },

  async researchHashtags(topic) {
    const res = await fetch(`${API_BASE}/ai/hashtags`, {
      method: 'POST',
      headers: getAiHeaders(),
      body: JSON.stringify({ topic })
    });
    return await res.json();
  },

  async predictEngagement(caption, platform, scheduledTime) {
    const res = await fetch(`${API_BASE}/ai/predict`, {
      method: 'POST',
      headers: getAiHeaders(),
      body: JSON.stringify({ caption, platform, scheduledTime })
    });
    return await res.json();
  }
};
