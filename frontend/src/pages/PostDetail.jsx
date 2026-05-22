import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Bookmark, Send, Trash2, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [id, isAuthenticated]);

  const fetchPostDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/posts/${id}`);
      setPost(data);
      
      // Determine if liked/saved
      if (isAuthenticated && user) {
        setLiked(data.likes.some((l) => l.userId === user.id));
        setSaved(data.saves.some((s) => s.userId === user.id));
      }
      setLikesCount(data._count.likes);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post. It might have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/posts/${id}/like`);
      setLiked(res.liked);
      setLikesCount(res.likeCount);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/posts/${id}/save`);
      setSaved(res.saved);
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { content: newComment });
      // Add the new comment to local state
      setPost((prev) => ({
        ...prev,
        comments: [res, ...prev.comments],
        _count: {
          ...prev._count,
          comments: prev._count.comments + 1
        }
      }));
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this pin? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/posts/${id}`);
      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Could not delete post: ' + err.message);
    }
  };

  if (loading) {
    return <div className="spinner" style={{ marginTop: '100px' }}></div>;
  }

  if (error) {
    return (
      <div className="detail-container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={() => navigate(-1)} className="detail-back-btn">
          <ArrowLeft size={18} />
          Go Back
        </button>
        <div style={{ color: 'var(--error-color)', fontSize: '18px', fontWeight: 'bold' }}>
          {error}
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated && user && post.authorId === user.id;

  return (
    <div className="detail-container">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="detail-back-btn">
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="detail-card">
        {/* Left Section - Image */}
        <div className="detail-image-sec">
          <img
            src={post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:5001${post.imageUrl}`}
            alt={post.title}
            className="detail-image"
          />
        </div>

        {/* Right Section - Text & Comments */}
        <div className="detail-content-sec">
          <div>
            {/* Top Toolbar */}
            <div className="detail-actions-top">
              <div className="detail-action-buttons">
                {/* Like Button */}
                <button
                  className={`detail-round-btn ${liked ? 'liked' : ''}`}
                  onClick={handleLikeToggle}
                  title="Like this Pin"
                >
                  <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                </button>
                <span style={{ alignSelf: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </span>
                
                {/* Delete Button (Author only) */}
                {isAuthor && (
                  <button
                    className="detail-round-btn"
                    onClick={handleDeletePost}
                    title="Delete Pin"
                    style={{ marginLeft: '12px', color: 'var(--error-color)' }}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {/* Save Button */}
              <button
                className={`pin-save-btn ${saved ? 'saved' : ''}`}
                onClick={handleSaveToggle}
              >
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Post Information */}
            <div className="detail-info">
              {post.category && <span className="detail-category">{post.category}</span>}
              <h1 className="detail-title">{post.title}</h1>
              <p className="detail-description">{post.description}</p>
            </div>

            {/* Author Profile Info */}
            <div className="detail-author-row">
              <Link to={`/profile/${post.author.username}`} className="detail-author">
                <img
                  src={post.author.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author.username}`}
                  alt={post.author.username}
                  className="detail-author-avatar"
                />
                <div className="detail-author-details">
                  <span className="detail-author-name">{post.author.username}</span>
                  <span className="detail-author-followers">Creator profile</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Comments Section */}
          <div className="detail-comments-sec">
            <h3 className="detail-comments-title">
              Comments ({post._count.comments + (post.comments.length - post._count.comments)})
            </h3>
            
            <div className="detail-comments-list">
              {post.comments.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: '14px', fontStyle: 'italic' }}>
                  No comments yet. Share your thoughts!
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <img
                      src={comment.author.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.author.username}`}
                      alt={comment.author.username}
                      className="comment-avatar"
                    />
                    <div className="comment-bubble">
                      <div className="comment-user">{comment.author.username}</div>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="comment-input-sec">
              <img
                src={
                  isAuthenticated && user
                    ? user.avatarUrl
                    : `https://api.dicebear.com/7.x/adventurer/svg?seed=anonymous`
                }
                alt="user avatar"
                className="comment-avatar"
              />
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={commenting}
                  required
                />
                <button
                  type="submit"
                  className="comment-send-btn"
                  disabled={commenting || !newComment.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
