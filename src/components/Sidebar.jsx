import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/create-plan', label: 'Create Plan', icon: '✨' },
    { path: '/dashboard/roadmap', label: 'My Roadmap', icon: '🗺️' },
    { path: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen sticky top-0 transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">SkillPilot AI</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Consistency is key! Complete your daily tasks to maintain your streak.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
