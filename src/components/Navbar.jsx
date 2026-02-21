import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ isLanding = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (username) => {
    return username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className={`${isLanding ? 'absolute top-0 left-0 right-0 z-50' : 'bg-white dark:bg-gray-900 shadow-sm'} py-4 transition-colors duration-200`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className={`text-xl font-bold ${isLanding ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              SkillPilot AI
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isLanding 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {isLanding ? (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-indigo-100 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>

                {isAuthenticated && user ? (
                  <div className="relative" ref={dropdownRef}>
                    {/* Profile Avatar Button */}
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      aria-label="User menu"
                    >
                      {user.profile_picture_url ? (
                        <img
                          src={`http://localhost:8000${user.profile_picture_url}`}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(user.username)}
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          >
                            👤 View Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
