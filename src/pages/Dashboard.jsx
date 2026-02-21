import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import ProgressBar from '../components/ProgressBar';
import { userProgress, todayTask, roadmap } from '../data/dummyData';
import { goalsAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState(() => {
    const saved = localStorage.getItem('userRoadmap');
    return saved ? JSON.parse(saved) : roadmap;
  });
  
  const [goals, setGoals] = useState([]);
  const [currentUserTask, setCurrentUserTask] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.listGoals();
      console.log('Goals response:', response.data);
      
      if (response.data.results && response.data.results.length > 0) {
        setGoals(response.data.results);
        // Get first incomplete task from first goal
        const firstGoal = response.data.results[0];
        console.log('First goal:', firstGoal);
        
        const tasksResponse = await goalsAPI.listTasks(firstGoal.id);
        console.log('Tasks response:', tasksResponse.data);
        
        // Look for tasks that are not completed (status: pending, in_progress, etc.)
        const allTasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
        const incompleteTasks = allTasks.filter(t => t.status !== 'completed');
        console.log('Incomplete tasks:', incompleteTasks);
        
        if (incompleteTasks.length > 0) {
          setCurrentUserTask(incompleteTasks[0]);
        } else if (allTasks.length > 0) {
          // If all tasks are completed, just take the first one
          setCurrentUserTask(allTasks[0]);
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      console.log('Using dummy data - no goals found');
    }
  };

  const completedDays = roadmapData.filter(item => item.status === 'done').length;
  const totalDays = roadmapData.length;
  const progressPercentage = Math.round((completedDays / totalDays) * 100);

  // Find today's task (first pending task)
  const currentTask = currentUserTask || roadmapData.find(item => item.status === 'pending') || todayTask;

  const handleStartLearning = () => {
    if (currentUserTask && currentUserTask.id) {
      navigate(`/learn/${currentUserTask.id}`);
    } else {
      // Show message to create a plan first
      navigate('/dashboard/create-plan');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your learning overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Overall Progress"
          value={`${progressPercentage}%`}
          icon="🎯"
          gradient="from-indigo-500 to-violet-500"
          subtitle={`${completedDays} of ${totalDays} days`}
        />
        <DashboardCard
          title="Current Streak"
          value={`${userProgress.currentStreak} days`}
          icon="🔥"
          gradient="from-orange-500 to-red-500"
          subtitle="Keep it going!"
        />
        <DashboardCard
          title="Learning Hours"
          value={`${userProgress.learningHours}h`}
          icon="⏰"
          gradient="from-cyan-500 to-blue-500"
          subtitle="This week"
        />
        <DashboardCard
          title="Active Goals"
          value={userProgress.activeGoals}
          icon="✨"
          gradient="from-green-500 to-emerald-500"
          subtitle="In progress"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Task */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">📚 Today's Task</h2>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                {currentUserTask ? 'Active' : `Day ${currentTask.day}`}
              </span>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-lg p-6 border border-indigo-100 dark:border-indigo-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {currentUserTask ? currentUserTask.topic : currentTask.topic}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentUserTask ? currentUserTask.description : (currentTask.description || 'Complete this task to advance in your learning journey.')}
              </p>
              
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                <span className="text-lg">⏱️</span>
                <span className="font-medium">{currentTask.duration}</span>
              </div>

              {currentTask.resources && currentTask.resources.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Resources:</h4>
                  <ul className="space-y-2">
                    {currentTask.resources.map((resource, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                onClick={handleStartLearning}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Start Learning →
              </button>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Weekly Activity</h2>
            <div className="grid grid-cols-7 gap-2">
              {userProgress.weeklyProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                  <div
                    className={`h-20 rounded-lg flex items-center justify-center ${
                      day.completed
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <div>
                      {day.completed ? (
                        <>
                          <div className="text-xl mb-1">✓</div>
                          <div className="text-xs font-semibold">{day.hours}h</div>
                        </>
                      ) : (
                        <div className="text-xl">-</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Progress Overview</h3>
            <ProgressBar progress={progressPercentage} label="Course Completion" />
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{completedDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining</span>
                <span className="font-semibold text-gray-900">
                  {totalDays - completedDays} days
                </span>
              </div>
            </div>

            <Link
              to="/dashboard/roadmap"
              className="block mt-4 text-center bg-indigo-50 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              View Full Roadmap →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/dashboard/create-plan"
                className="block bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all text-center"
              >
                + Create New Plan
              </Link>
              <Link
                to="/dashboard/analytics"
                className="block bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                📈 View Analytics
              </Link>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <div className="text-4xl mb-3 text-center">🌟</div>
            <p className="text-sm text-gray-700 text-center italic">
              "The expert in anything was once a beginner. Keep going!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
