import React from 'react';

const DashboardCard = ({ title, value, icon, gradient = "from-indigo-500 to-violet-500", subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
