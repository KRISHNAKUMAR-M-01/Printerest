import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MasonryGrid from '../components/MasonryGrid';

const CATEGORIES = ['All', 'Design', 'Photography', 'Nature', 'Travel', 'Quotes', 'Tech', 'Art', 'Fashion'];

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Active Filter
  const activeCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const observerTarget = useRef(null);

  // Fetch initial posts on search/category change
  useEffect(() => {
    setPosts([]);
    setPage(1);
    fetchPosts(1, true);
    if (isAuthenticated && user) {
      fetchSavedPostIds();
    }
  }, [searchQuery, activeCategory, isAuthenticated]);

  // Infinite scroll intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, page]);

  const fetchPosts = async (pageNum, isNewSearch = false) => {
    if (isNewSearch) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const categoryParam = activeCategory !== 'All' ? `&category=${encodeURIComponent(activeCategory)}` : '';
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const data = await api.get(`/posts?page=${pageNum}&limit=12${categoryParam}${searchParam}`);
      
      setPosts((prev) => (isNewSearch ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Could not load feed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSavedPostIds = async () => {
    try {
      const savedPosts = await api.get(`/users/profile/${user.username}/saved`);
      setSavedPostIds(savedPosts.map((post) => post.id));
    } catch (err) {
      console.error('Error fetching saved post IDs:', err);
    }
  };

  const loadNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, false);
  };

  const handleCategoryClick = (category) => {
    const params = {};
    if (category !== 'All') {
      params.category = category;
    }
    if (searchQuery) {
      params.search = searchQuery;
    }
    setSearchParams(params);
  };

  const handleToggleSave = (postId, isSaved) => {
    setSavedPostIds((prev) =>
      isSaved ? [...prev, postId] : prev.filter((id) => id !== postId)
    );
  };

  return (
    <div className="home-container">
      {/* Category Pills Bar */}
      <div className="categories-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ textAlign: 'center', margin: '20px', color: 'var(--error-color)' }}>
          <p>{error}</p>
        </div>
      )}

      {/* Grid */}
      {loading && page === 1 ? (
        <div className="spinner"></div>
      ) : (
        <>
          <MasonryGrid
            posts={posts}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
          />
          
          {/* Scroll Target Observer */}
          <div ref={observerTarget} style={{ height: '50px', margin: '20px 0' }}>
            {loadingMore && <div className="spinner"></div>}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
