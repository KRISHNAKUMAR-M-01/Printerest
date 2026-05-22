import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, Plus } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL search param
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="nav-container">
      {/* Brand Logo */}
      <Link to="/" className="nav-logo">
        <svg viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.17-.1-.95-.2-2.4.04-3.44.22-.94 1.4-5.95 1.4-5.95s-.36-.72-.36-1.77c0-1.66.96-2.9 2.17-2.9 1.02 0 1.51.77 1.51 1.7 0 1.03-.66 2.57-1 4a1.76 1.76 0 0 0 1.8 2.16c2.16 0 3.82-2.28 3.82-5.57 0-2.9-2.09-4.94-5.07-4.94-3.45 0-5.48 2.6-5.48 5.26 0 1.04.4 2.16.9 2.77.1.12.12.22.09.34l-.34 1.4c-.06.24-.18.28-.42.17C4.1 18.06 3 15.34 3 12.56c0-4.06 2.95-7.79 8.5-7.79 4.46 0 7.93 3.18 7.93 7.43 0 4.43-2.79 8-6.68 8-1.3 0-2.53-.68-2.95-1.48l-.8 3.06c-.29 1.1-.1 2.45.05 3.32C10.15 23.9 11.06 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
        </svg>
        <span className="nav-logo-text">Printerest</span>
      </Link>

      <Link to="/" className="nav-link-active">Home</Link>

      {isAuthenticated && (
        <Link to="/create" className="nav-link">
          Create
        </Link>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="nav-search-form">
        <div className="nav-search-wrapper">
          <Search size={18} className="nav-search-icon" />
          <input
            type="text"
            placeholder="Search for ideas, designs, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
        </div>
      </form>

      {/* User Actions */}
      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <Link to={`/profile/${user.username}`} className="nav-profile-btn">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                alt={user.username}
                className="nav-avatar"
              />
              <span className="nav-username">{user.username}</span>
            </Link>
            <button onClick={logout} title="Log Out" className="nav-logout-btn">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-login-btn">Log in</Link>
            <Link to="/register" className="nav-signup-btn">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
