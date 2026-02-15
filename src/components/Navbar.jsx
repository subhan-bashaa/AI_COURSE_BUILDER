import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLanding = false }) => {
  return (
    <nav className={`${isLanding ? 'absolute top-0 left-0 right-0 z-50' : 'bg-white shadow-sm'} py-4`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className={`text-xl font-bold ${isLanding ? 'text-white' : 'text-gray-900'}`}>
              SkillPilot AI
            </span>
          </Link>

          <div className="flex items-center space-x-4">
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
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
                <button className="text-gray-700 hover:text-indigo-600 transition-colors">
                  Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
