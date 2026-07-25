import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import {
  generateIdeasWithLLM,
  generateCaptionWithLLM,
  researchHashtagsWithLLM,
  predictEngagementWithLLM
} from './services/llmService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// Helper DB Read/Write
function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { workspaces: [], users: [], posts: [], comments: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// Root Route Welcome Page
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 50px; background: #080b11; color: #f8fafc; min-height: 100vh; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background: #121826; border: 1px solid rgba(255,255,255,0.1); padding: 32px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h1 style="color: #a78bfa; margin-bottom: 8px;">⚡ SocialSync AI REST API (LLM Powered)</h1>
        <p style="color: #94a3b8; margin-bottom: 24px;">The Express.js Backend REST API Server is running on port <strong>5001</strong> with Google Gemini LLM engine.</p>
        
        <div style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); padding: 16px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="margin-bottom: 6px; color: #fff;">🌐 Access the Web Application UI</h3>
          <p style="margin-bottom: 12px; font-size: 0.9rem;">To use the Social Media Calendar & AI Studio interface, open:</p>
          <a href="http://localhost:3002" style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #fff; text-decoration: none; font-weight: bold; border-radius: 8px;">
            Open App UI (http://localhost:3002) →
          </a>
        </div>

        <div style="font-size: 0.85rem; color: #64748b;">
          Backend Health Endpoint: <a href="/api/health" style="color: #06b6d4;">/api/health</a>
        </div>
      </div>
    </div>
  `);
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SocialSync AI Express Backend Server with Gemini LLM is running',
    llmConfigured: !!(process.env.GEMINI_API_KEY),
    timestamp: new Date()
  });
});

// Trigger LinkedIn Publisher Agent Endpoint
app.post('/api/publish/linkedin', (req, res) => {
  const agentPath = path.join(__dirname, '..', 'agent', 'linkedin_publisher.py');
  console.log('⚡ Triggering LinkedIn Publisher Agent via Python:', agentPath);

  exec(`python "${agentPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('LinkedIn Publisher Error:', stderr || error.message);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    console.log('LinkedIn Publisher Output:', stdout);
    res.json({ success: true, output: stdout });
  });
});

// Auth REST API Routes
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const db = readDb();
  let user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      name: (email || 'User').split('@')[0],
      email: email || 'user@example.com',
      role: 'Editor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      title: 'Content Strategist'
    };
    db.users.push(user);
    writeDb(db);
  }

  res.json({ success: true, user });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email } = req.body;
  const db = readDb();
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name || 'New Creator',
    email: email,
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    title: 'Workspace Owner'
  };
  db.users.push(newUser);
  writeDb(db);
  res.json({ success: true, user: newUser });
});

app.post('/api/auth/demo', (req, res) => {
  const { userIndex } = req.body;
  const db = readDb();
  const user = db.users[userIndex || 0] || db.users[0];
  res.json({ success: true, user });
});

// Workspace REST API Routes
app.get('/api/workspaces', (req, res) => {
  const db = readDb();
  res.json(db.workspaces || []);
});

app.get('/api/workspaces/:id', (req, res) => {
  const db = readDb();
  const ws = db.workspaces.find(w => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: 'Workspace not found' });
  res.json(ws);
});

// Posts REST API Routes
app.get('/api/posts', (req, res) => {
  const { workspaceId } = req.query;
  const db = readDb();
  let posts = db.posts || [];
  if (workspaceId) {
    posts = posts.filter(p => p.workspaceId === workspaceId);
  }
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const db = readDb();
  const postData = req.body;
  const newPost = {
    ...postData,
    id: `post-${Date.now()}`,
    workspaceId: postData.workspaceId || 'ws-1',
    createdAt: new Date().toISOString(),
    engagementScore: postData.engagementScore || Math.floor(Math.random() * 15) + 82
  };
  db.posts.unshift(newPost);
  writeDb(db);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const index = db.posts.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Post not found' });

  db.posts[index] = { ...db.posts[index], ...req.body };
  writeDb(db);
  res.json(db.posts[index]);
});

app.delete('/api/posts/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.posts = db.posts.filter(p => p.id !== id);
  db.comments = db.comments.filter(c => c.postId !== id);
  writeDb(db);
  res.json({ success: true, deletedId: id });
});

// Comments REST API Routes
app.get('/api/posts/:id/comments', (req, res) => {
  const db = readDb();
  const comments = (db.comments || []).filter(c => c.postId === req.params.id);
  res.json(comments);
});

app.post('/api/posts/:id/comments', (req, res) => {
  const db = readDb();
  const { author, avatar, text } = req.body;
  const newComment = {
    id: `c-${Date.now()}`,
    postId: req.params.id,
    author: author || 'Alex Morgan',
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    text,
    createdAt: new Date().toISOString()
  };
  db.comments.push(newComment);
  writeDb(db);
  res.status(201).json(newComment);
});

// LLM AI Engine REST API Routes
app.post('/api/ai/ideas', async (req, res) => {
  const apiKey = req.headers['x-gemini-api-key'];
  const { niche, goal, targetAudience } = req.body;
  const ideas = await generateIdeasWithLLM({ niche, goal, targetAudience, apiKey });
  res.json({ success: true, ideas });
});

app.post('/api/ai/caption', async (req, res) => {
  const apiKey = req.headers['x-gemini-api-key'];
  const { topic, platform, tone, keyPoints, callToAction } = req.body;
  const result = await generateCaptionWithLLM({ topic, platform, tone, keyPoints, callToAction, apiKey });
  res.json({ success: true, ...result });
});

app.post('/api/ai/hashtags', async (req, res) => {
  const apiKey = req.headers['x-gemini-api-key'];
  const { topic } = req.body;
  const result = await researchHashtagsWithLLM({ topic, apiKey });
  res.json({ success: true, ...result });
});

app.post('/api/ai/predict', async (req, res) => {
  const apiKey = req.headers['x-gemini-api-key'];
  const { caption, platform, scheduledTime } = req.body;
  const result = await predictEngagementWithLLM({ caption, platform, scheduledTime, apiKey });
  res.json({ success: true, ...result });
});

app.listen(PORT, () => {
  console.log(`⚡ Express LLM Backend Server listening on http://localhost:${PORT}`);
});
