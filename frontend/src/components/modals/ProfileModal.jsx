import React from 'react';
import { X, Check, Lock, CreditCard, CheckCircle2 } from 'lucide-react';

export default function ProfileModal({
  profileModalOpen,
  setProfileModalOpen,
  currentUser,
  profileTab,
  setProfileTab,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editAvatar,
  setEditAvatar,
  handleSaveProfile,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangePassword,
  userPlan,
  navigate
}) {
  if (!profileModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={currentUser?.avatar} alt="Avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #8b5cf6' }} />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#fff' }}>Account & Profile Settings</h2>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4' }}>{currentUser?.email}</div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setProfileModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
          <button
            onClick={() => setProfileTab('profile')}
            className={`btn ${profileTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            👤 Edit Profile
          </button>
          <button
            onClick={() => setProfileTab('password')}
            className={`btn ${profileTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            🔒 Change Password
          </button>
          <button
            onClick={() => setProfileTab('subscription')}
            className={`btn ${profileTab === 'subscription' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            💳 Active Subscription
          </button>
        </div>

        {/* Tab 1: Edit Profile */}
        {profileTab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="input-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="input-control" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Avatar URL</label>
              <input type="text" className="input-control" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Presets:</span>
                {['Prerna', 'Alex', 'Sarah', 'Dev'].map(seed => (
                  <button
                    type="button"
                    key={seed}
                    onClick={() => setEditAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`)}
                    style={{ padding: '4px 10px', borderRadius: '15px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {seed} Avatar
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setProfileModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Check size={16} /> Save Profile Updates</button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {profileTab === 'password' && (
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input type="password" className="input-control" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input type="password" className="input-control" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input type="password" className="input-control" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setProfileModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Lock size={16} /> Update Password</button>
            </div>
          </form>
        )}

        {/* Tab 3: Active Subscription */}
        {profileTab === 'subscription' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge status-published" style={{ marginBottom: '8px', display: 'inline-block' }}>ACTIVE PLAN</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{userPlan}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Renews automatically on Aug 25, 2026</div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#c084fc' }}>₹499</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> 15 Social Channels Connected</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Unlimited Gemini AI Content Generation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> 20s Background Agent Publishing Loop</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => { setProfileModalOpen(false); navigate('/pricing'); }}>
                Change Plan / Upgrade <CreditCard size={16} color="#06b6d4" />
              </button>
              <button className="btn btn-cyan" onClick={() => setProfileModalOpen(false)}>
                Close Settings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
