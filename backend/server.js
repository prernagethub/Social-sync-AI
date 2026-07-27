import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  generateIdeasWithLLM,
  generateCaptionWithLLM,
  researchHashtagsWithLLM,
  predictEngagementWithLLM
} from './services/llmService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'socialsync_secret_jwt_key_2026';

// JWT Helper & Middleware
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'Admin'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid or expired JWT token' });
    req.user = decoded;
    next();
  });
}

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

// Trigger Auto Publisher Agent Endpoint
app.post('/api/publish/auto', (req, res) => {
  const agentPath = path.join(__dirname, '..', 'agents', 'auto_scheduler.py');
  console.log('⚡ Triggering Auto-Scheduler Agent via Python:', agentPath);

  exec(`python "${agentPath}" --once`, (error, stdout, stderr) => {
    if (error) {
      console.error('Auto-Scheduler Error:', stderr || error.message);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    console.log('Auto-Scheduler Output:', stdout);
    res.json({ success: true, output: stdout });
  });
});

// Trigger LinkedIn Publisher Agent Endpoint
app.post('/api/publish/linkedin', (req, res) => {
  const agentPath = path.join(__dirname, '..', 'agents', 'auto_scheduler.py');
  console.log('⚡ Triggering LinkedIn Publisher Agent via Python:', agentPath);

  exec(`python "${agentPath}" --once`, (error, stdout, stderr) => {
    if (error) {
      console.error('LinkedIn Publisher Error:', stderr || error.message);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    console.log('LinkedIn Publisher Output:', stdout);
    res.json({ success: true, output: stdout });
  });
});

// Trigger Twitter / X Publisher Agent Endpoint
app.post('/api/publish/twitter', (req, res) => {
  const agentPath = path.join(__dirname, '..', 'agents', 'twitter_publisher.py');
  console.log('⚡ Triggering Twitter Publisher Agent via Python:', agentPath);

  exec(`python "${agentPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Twitter Publisher Error:', stderr || error.message);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    console.log('Twitter Publisher Output:', stdout);
    res.json({ success: true, output: stdout });
  });
});

// Auth REST API Routes (with JWT Support)
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json({ success: true, count: db.users.length, users: db.users.map(({ password, ...u }) => u) });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Email address is required' });
  }
  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: `No account found with email '${normalizedEmail}'. Please click 'Create Account' to sign up!`
    });
  }

  let isMatch = false;
  if (user.password) {
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text check & auto-migrate to Bcrypt hash
      isMatch = (user.password === password);
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        writeDb(db);
      }
    }
  } else {
    user.password = await bcrypt.hash(password, 10);
    writeDb(db);
    isMatch = true;
  }

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: '❌ Incorrect password! Please check your password and try again.'
    });
  }

  const token = generateToken(user);
  const { password: userPassword, ...safeUser } = user;

  res.json({
    success: true,
    token,
    user: safeUser,
    message: 'Authenticated successfully with JWT & Bcrypt'
  });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role, title } = req.body;
  
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Email address is required' });
  }
  if (!password || password.trim().length < 4) {
    return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: `Account already exists with email '${normalizedEmail}'. Please sign in instead.`
    });
  }

  // Hash password using Bcrypt (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: `usr-${Date.now()}`,
    name: (name && name.trim()) || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    password: hashedPassword,
    role: role || 'Admin',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
    title: title || 'Workspace Owner',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);
  
  const token = generateToken(newUser);
  const { password: newUserPassword, ...safeUser } = newUser;

  console.log(`🔒 New user registered, Bcrypt hashed & JWT issued: ${safeUser.email} (ID: ${safeUser.id})`);
  res.status(201).json({
    success: true,
    token,
    user: safeUser,
    message: 'Account created & authenticated successfully with Bcrypt & JWT'
  });
});

app.post('/api/auth/demo', (req, res) => {
  const { userIndex } = req.body;
  const db = readDb();
  const user = db.users[userIndex || 0] || db.users[0];
  const token = generateToken(user);
  const { password, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
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
