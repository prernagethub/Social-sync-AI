import React, { useState, useEffect } from 'react';
import LandingPage from './components/landing/LandingPage';
import AuthModal from './components/auth/AuthModal';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CalendarView from './components/calendar/CalendarView';
import KanbanView from './components/calendar/KanbanView';
import AIStudio from './components/ai/AIStudio';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import TeamSettings from './components/team/TeamSettings';
import PostEditorModal from './components/post/PostEditorModal';
import { db } from './services/db';
import { auth } from './services/auth';

export default function App() {
  const [user, setUser] = useState(auth.getUser());
  const [view, setView] = useState('landing'); // 'landing' | 'app'
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'ai-studio' | 'kanban' | 'analytics' | 'team'
  
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [postModal, setPostModal] = useState({ open: false, post: null });

  const [currentWorkspace, setCurrentWorkspace] = useState(db.getCurrentWorkspace());
  const [posts, setPosts] = useState(db.getPosts(currentWorkspace?.id));
  const [filterPlatform, setFilterPlatform] = useState('all');

  // Initial Sync from Express REST API
  useEffect(() => {
    const loadApiData = async () => {
      if (currentWorkspace?.id) {
        const synced = await db.syncPosts(currentWorkspace.id);
        setPosts(synced);
      }
    };
    loadApiData();

    const unsubDb = db.subscribe(() => {
      const ws = db.getCurrentWorkspace();
      setCurrentWorkspace(ws);
      setPosts(db.getPosts(ws?.id));
    });

    const unsubAuth = auth.subscribe(() => {
      setUser(auth.getUser());
    });

    return () => {
      unsubDb();
      unsubAuth();
    };
  }, [currentWorkspace?.id]);

  const handleLaunchApp = () => {
    setView('app');
  };

  const handleGoLanding = () => {
    setView('landing');
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModal({ open: true, mode });
  };

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    setAuthModal({ open: false, mode: 'login' });
    setView('app');
  };

  const handleLogout = () => {
    auth.logout();
    setView('landing');
  };

  const handleSwitchWorkspace = async (id) => {
    db.setCurrentWorkspaceId(id);
    const ws = db.getCurrentWorkspace();
    setCurrentWorkspace(ws);
    const synced = await db.syncPosts(id);
    setPosts(synced);
  };

  // Post CRUD Operations
  const handleOpenCreatePost = (initialData = {}) => {
    setPostModal({ open: true, post: initialData });
  };

  const handleEditPost = (post) => {
    setPostModal({ open: true, post });
  };

  const handleSavePost = async (postData) => {
    await db.savePost({
      ...postData,
      workspaceId: currentWorkspace?.id || 'ws-1'
    });
    setPostModal({ open: false, post: null });
  };

  const handleDeletePost = async (id) => {
    await db.deletePost(id);
  };

  // Turn AI Idea into Post Draft
  const handleCreatePostFromIdea = (idea) => {
    setPostModal({
      open: true,
      post: {
        title: idea.title,
        platform: idea.suggestedPlatform || 'linkedin',
        status: 'idea',
        caption: `${idea.title}\n\nKey Angle: ${idea.angle}\n\nCategory: ${idea.category}`,
        hashtags: ['#Growth', '#Strategy', '#Innovation']
      }
    });
  };

  const handleCreatePostWithCaption = (data) => {
    setPostModal({
      open: true,
      post: {
        title: data.title || 'New AI Caption Draft',
        platform: data.platform || 'linkedin',
        status: 'draft',
        caption: data.caption,
        hashtags: data.hashtags || []
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {view === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onLaunchApp={handleLaunchApp}
          onDemoLogin={async () => handleAuthSuccess(await auth.demoLogin(0))}
          user={user}
        />
      ) : (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onGoLanding={handleGoLanding}
            onLogout={handleLogout}
            user={user}
          />

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Header
              onOpenCreatePost={() => handleOpenCreatePost()}
              onOpenAIStudio={() => setActiveTab('ai-studio')}
              filterPlatform={filterPlatform}
              setFilterPlatform={setFilterPlatform}
              currentWorkspace={currentWorkspace}
              onSwitchWorkspace={handleSwitchWorkspace}
            />

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'calendar' && (
                <CalendarView
                  posts={posts}
                  onSelectPost={handleEditPost}
                  onCreateOnDate={(dateStr) => handleOpenCreatePost({ scheduledDate: dateStr })}
                  filterPlatform={filterPlatform}
                  onDeletePost={handleDeletePost}
                />
              )}

              {activeTab === 'ai-studio' && (
                <AIStudio
                  onCreatePostFromIdea={handleCreatePostFromIdea}
                  onCreatePostWithCaption={handleCreatePostWithCaption}
                />
              )}

              {activeTab === 'kanban' && (
                <KanbanView
                  posts={posts}
                  onSelectPost={handleEditPost}
                  onCreateOnStatus={(statusVal) => handleOpenCreatePost({ status: statusVal })}
                  filterPlatform={filterPlatform}
                  onDeletePost={handleDeletePost}
                />
              )}

              {activeTab === 'analytics' && <AnalyticsDashboard posts={posts} />}

              {activeTab === 'team' && <TeamSettings currentWorkspace={currentWorkspace} currentUser={user} />}
            </div>
          </main>
        </div>
      )}

      {/* Auth Modal */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Post Editor Modal */}
      {postModal.open && (
        <PostEditorModal
          post={postModal.post}
          onClose={() => setPostModal({ open: false, post: null })}
          onSave={handleSavePost}
          currentUser={user}
        />
      )}
    </div>
  );
}
