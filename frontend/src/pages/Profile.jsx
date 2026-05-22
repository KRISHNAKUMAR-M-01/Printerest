import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Edit2 } from 'lucide-react';
import api from '../utils/api';
import MasonryGrid from '../components/MasonryGrid';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'saved'
  
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [updating, setUpdating] = useState(false);

  const isOwnProfile = isAuthenticated && currentUser && currentUser.username.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    fetchProfile();
    setActiveTab('created');
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchUserPosts();
    }
  }, [profile, activeTab]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/users/profile/${username}`);
      setProfile(data);
      setNewBio(data.bio || '');
      setNewAvatar(data.avatarUrl || '');
      
      // If own profile, we can fetch all saved IDs to sync masonry grid save state
      if (isOwnProfile) {
        setSavedPostIds(data.saves || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('User profile not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    setPostsLoading(true);
    try {
      const data = await api.get(`/users/profile/${username}/${activeTab}`);
      setPosts(data);

      // If own profile, ensure we sync our local save state
      if (isOwnProfile) {
        if (activeTab === 'saved') {
          setSavedPostIds(data.map((p) => p.id));
        } else {
          // Fetch saved to compare on created tab
          const savedData = await api.get(`/users/profile/${username}/saved`);
          setSavedPostIds(savedData.map((p) => p.id));
        }
      } else if (isAuthenticated && currentUser) {
        // Fetch current user's saved pins to show correct save state on other profiles
        const savedData = await api.get(`/users/profile/${currentUser.username}/saved`);
        setSavedPostIds(savedData.map((p) => p.id));
      }
    } catch (err) {
      console.error(`Error fetching user ${activeTab} posts:`, err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updatedUser = await updateProfile(newBio, newAvatar);
      setProfile((prev) => ({
        ...prev,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl
      }));
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleSave = (postId, isSaved) => {
    // If it's own profile and we are on 'saved' tab, unsaving should remove the card immediately from display
    if (isOwnProfile && activeTab === 'saved' && !isSaved) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
    
    setSavedPostIds((prev) =>
      isSaved ? [...prev, postId] : prev.filter((id) => id !== postId)
    );
  };

  if (loading) {
    return <div className="spinner" style={{ marginTop: '100px' }}></div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--error-color)' }}>
        <h2>{error}</h2>
        <button onClick={() => navigate('/')} className="btn-secondary" style={{ marginTop: '20px' }}>
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Info */}
      <div className="profile-header">
        <img
          src={profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.username}`}
          alt={profile.username}
          className="profile-avatar-large"
        />
        <h1 className="profile-name">{profile.username}</h1>
        <p className="profile-username">@{profile.username}</p>
        {profile.bio ? (
          <p className="profile-bio">{profile.bio}</p>
        ) : (
          <p className="profile-bio" style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>
            No bio description yet.
          </p>
        )}

        {isOwnProfile && (
          <button className="profile-edit-btn" onClick={() => setShowEditModal(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <div
          className={`profile-tab ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created
        </div>
        <div
          className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </div>
      </div>

      {/* Tab Content (Masonry Grid) */}
      {postsLoading ? (
        <div className="spinner"></div>
      ) : (
        <MasonryGrid
          posts={posts}
          savedPostIds={savedPostIds}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <X className="modal-close" onClick={() => setShowEditModal(false)} />
            <h2 className="modal-title">Edit Profile Details</h2>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="auth-form" style={{ gap: '20px' }}>
                <div>
                  <label className="auth-label">Profile Image URL</label>
                  <input
                    type="url"
                    className="auth-input"
                    placeholder="https://example.com/avatar.jpg"
                    value={newAvatar}
                    onChange={(e) => setNewAvatar(e.target.value)}
                    disabled={updating}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                    Leave blank to use a default animated avatar.
                  </span>
                </div>

                <div>
                  <label className="auth-label">Bio Description</label>
                  <textarea
                    className="auth-input"
                    style={{ minHeight: '100px', resize: 'none' }}
                    placeholder="Tell your followers about yourself..."
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    maxLength={160}
                    disabled={updating}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
