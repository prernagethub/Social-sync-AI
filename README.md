# SocialSync AI - Autonomous Social Media Agent Platform 🚀

SocialSync AI is an end-to-end social media automation platform featuring a 7x5 Visual Content Calendar, 4-in-1 Gemini AI Studio, Real-Time Analytics Dashboard, and Autonomous Python Background Publishing Agents.

---

## 📁 Architecture & Directory Structure

```text
Social_media/
├── 🎨 frontend/               # React + Vite Frontend UI
│   ├── src/
│   │   ├── components/       # UI Components & Navigation
│   │   │   └── modals/       # Modular Modals (Auth, Profile, Post, Share, Settings, Sql)
│   │   ├── services/         # Gemini AI & Supabase Engine Services
│   │   └── App.jsx           # Main App Routing & Application Shell
│   ├── package.json
│   └── vite.config.js
│
├── ⚙️ backend/                # Express.js LLM & API Server (Port 5001)
│   ├── server.js             # Express API Endpoints & LinkedIn Agent Bridge
│   ├── services/             # Gemini LLM Integration
│   └── package.json
│
├── 🤖 agents/                 # Autonomous Python Background Agents
│   ├── auto_scheduler.py     # 20s Polling Loop for Scheduled Supabase Posts
│   ├── crew_poster.py        # CrewAI Multi-Agent Task Orchestrator
│   ├── linkedin_publisher.py # Official LinkedIn API Publisher
│   ├── twitter_publisher.py  # X / Twitter API Publisher
│   └── requirements.txt
│
└── 🗄️ database/               # Database Schemas & Migrations
    └── schema.sql            # Supabase PostgreSQL Table Schemas & Alter Queries
```

---

## ⚡ Quick Start

### 1. Launch Frontend UI (Port 3003)
```bash
cd frontend
npm run dev
```

### 2. Launch Express Backend Server (Port 5001)
```bash
cd backend
node server.js
```

### 3. Launch Autonomous Background Publishing Agent Loop
```bash
cd agents
python auto_scheduler.py
```

---

## 🌟 Key Features
- 📅 **7x5 Month Visual Grid & Subpath Routing** (`/calendar/linkedin`, `/calendar/twitter`)
- 🤖 **4-in-1 AI Studio Suite** (Ideas Generator, Copywriter, Hashtags, Predictive Scores)
- 📊 **Real-Time Dynamic Reach Analytics** (`/analytics`)
- 🔗 **Public Read-Only Client Share Link** (`/share/calendar`)
- 📤 **1-Click CSV Calendar Export**
- 👤 **Profile & Account Settings Modal** (Profile Edit, Change Password, Active Plan)
- 🔔 **Bottom-Right Smooth Slide Toastify Notifications** (2s Auto-Dismiss)
