import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { goalsAPI, analyticsAPI, handleAPIError } from '../services/api';
import AnalyticsChart from '../components/Analytics';
import Navbar from '../components/Navbar';

const AnalyticsPage = () => {
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);

  useEffect(() => {
    fetchGoalsAndStats();
  }, []);

  const fetchGoalsAndStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [goalsRes, statsRes] = await Promise.all([
        goalsAPI.listGoals({ per_page: 100 }),
        analyticsAPI.getDashboardOverview()
      ]);

      const goalsData = goalsRes.data.goals;
      setGoals(goalsData);
      setOverviewStats(statsRes.data.overview);

      // Select first goal if available
      if (goalsData.length > 0) {
        setSelectedGoalId(goalsData[0].id);
      }
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your learning performance and consistency.</p>
      </div>

      {/* Overview Stats */}
      {overviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Goals</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {overviewStats.total_goals}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed Tasks</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {overviewStats.completed_tasks}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 p-6 rounded-lg border border-violet-200 dark:border-violet-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Completion</p>
            <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
              {overviewStats.average_completion_percentage}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Best Streak</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              🔥 {overviewStats.best_streak}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Goal Selection */}
      {goals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Goal to View Analytics</h2>
          <div className="flex flex-wrap gap-2">
            {goals.map(goal => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedGoalId === goal.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {goal.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {selectedGoalId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <AnalyticsChart goalId={selectedGoalId} />
        </div>
      )}

      {/* No Goals Message */}
      {!isLoading && goals.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            No goals yet. Create your first goal to see analytics!
          </p>
          <a href="/dashboard/create-plan" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Create Goal
          </a>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
