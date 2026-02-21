/**
 * Analytics Component
 * Displays charts and insights for goal progress using Recharts
 */
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { analyticsAPI, handleAPIError } from '../services/api';

const Analytics = ({ goalId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [goalId]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [analyticsRes, weeklyRes] = await Promise.all([
        analyticsAPI.getGoalAnalytics(goalId),
        analyticsAPI.getWeeklyProgress(goalId)
      ]);

      setAnalytics(analyticsRes.data);
      setWeekly(weeklyRes.data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-full">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-gray-600 dark:text-gray-400">No analytics available</div>;
  }

  // Chart data for weekly progress
  const weeklyChartData = weekly?.weekly_data?.map(item => ({
    week: `Week ${item.week_number}`,
    completed: item.completed
  })) || [];

  // Chart data for completion pie
  const pieData = [
    { name: 'Completed', value: analytics.completed_tasks },
    { name: 'Pending', value: analytics.pending_tasks }
  ];

  const COLORS = ['#4f46e5', '#e5e7eb'];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {analytics.completion_percentage}%
          </p>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${analytics.completion_percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Streak</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            🔥 {analytics.current_streak}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">days in a row</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Best Streak</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            🏆 {analytics.longest_streak}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">days best</p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 p-6 rounded-lg border border-violet-200 dark:border-violet-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Weekly Progress</p>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
            {analytics.weekly_completed}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">tasks completed</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Progress</h3>
          {weeklyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="completed" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
          )}
        </div>

        {/* Completion Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Breakdown</h3>
          {analytics.total_tasks > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} tasks`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tasks yet</p>
          )}
        </div>
      </div>

      {/* Pace Indicator */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Progress Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">Pace:</p>
            <span className={`px-4 py-2 rounded-lg font-semibold ${
              analytics.current_pace === 'ahead'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : analytics.current_pace === 'on-track'
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
            }`}>
              {analytics.current_pace === 'ahead' && '✅ Ahead of schedule'}
              {analytics.current_pace === 'on-track' && '📌 On track'}
              {analytics.current_pace === 'behind' && '⚠️ Behind schedule'}
            </span>
          </div>
          {analytics.days_remaining !== null && (
            <div className="flex items-center justify-between">
              <p className="text-gray-700 dark:text-gray-300">Days Remaining:</p>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {analytics.days_remaining} days
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
