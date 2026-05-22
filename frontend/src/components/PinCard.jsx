import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { getBackendUrl } from '../utils/api';

const PinCard = ({ post, onToggleSave, initialSaved = false, onLikeToggle }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initialSaved);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);

  const handleCardClick = (e) => {
    // If user clicked save button or profile link, don't navigate
    if (e.target.closest('.pin-save-btn') || e.target.closest('.pin-author') || e.target.closest('.pin-action-icon')) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/posts/${post.id}/save`);
      setSaved(res.saved);
      if (onToggleSave) onToggleSave(post.id, res.saved);
    } catch (err) {
      console.error('Error saving pin:', err);
    }
  };

  return (
    <div className="masonry-item">
      <div className="pin-card" onClick={handleCardClick}>
        <div className="pin-img-wrapper">
          <img
            src={post.imageUrl.startsWith('http') ? post.imageUrl : `${getBackendUrl()}${post.imageUrl}`}
            alt={post.title}
            className="pin-image"
            loading="lazy"
          />
          <div className="pin-overlay">
            <button
              className={`pin-save-btn ${saved ? 'saved' : ''}`}
              onClick={handleSaveClick}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            <div className="pin-overlay-bottom">
              <span className="pin-action-icon" title="View details">
                <Bookmark size={16} />
              </span>
            </div>
          </div>
        </div>
        <div className="pin-meta">
          <h3 className="pin-title">{post.title}</h3>
          {post.author && (
            <Link to={`/profile/${post.author.username}`} className="pin-author">
              <img
                src={post.author.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author.username}`}
                alt={post.author.username}
                className="pin-author-avatar"
              />
              <span className="pin-author-name">{post.author.username}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinCard;
