import React, { useState, useEffect } from 'react';
import RoadmapCard from '../components/RoadmapCard';
import ProgressBar from '../components/ProgressBar';
import { roadmap as initialRoadmap, userGoals } from '../data/dummyData';
import { goalsAPI } from '../services/api';

const Roadmap = () => {
  const [roadmapData, setRoadmapData] = useState([]);
  const [userGoal, setUserGoal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load goals and tasks from API
  useEffect(() => {
    loadGoalsAndTasks();
  }, []);

  const loadGoalsAndTasks = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.listGoals();
      console.log('Goals loaded:', response.data);
      
      if (response.data.results && response.data.results.length > 0) {
        const firstGoal = response.data.results[0];
        setUserGoal(firstGoal);
        
        // Load tasks for this goal
        const tasksResponse = await goalsAPI.listTasks(firstGoal.id);
        console.log('Tasks loaded:', tasksResponse.data);
        
        const tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
        
        // Convert tasks to roadmap format with day numbers
        const roadmap = tasks.map((task, index) => ({
          day: index + 1,
          topic: task.topic,
          status: task.status === 'completed' ? 'done' : 'pending',
          duration: task.estimated_time || '2 hours',
          taskId: task.id // Add task ID for navigation
        }));
        
        setRoadmapData(roadmap);
      } else {
        // Fallback to dummy data if no goals
        const saved = localStorage.getItem('userRoadmap');
        setRoadmapData(saved ? JSON.parse(saved) : initialRoadmap);
        const savedGoal = localStorage.getItem('userGoal');
        setUserGoal(savedGoal ? JSON.parse(savedGoal) : userGoals[0]);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      // Fallback to dummy data
      const saved = localStorage.getItem('userRoadmap');
      setRoadmapData(saved ? JSON.parse(saved) : initialRoadmap);
      const savedGoal = localStorage.getItem('userGoal');
      setUserGoal(savedGoal ? JSON.parse(savedGoal) : userGoals[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (day) => {
    // Find the task
    const task = roadmapData.find(item => item.day === day);
    if (!task || !task.taskId) {
      // Fallback to local state update
      setRoadmapData(prevData =>
        prevData.map(item =>
          item.day === day
            ? { ...item, status: item.status === 'done' ? 'pending' : 'done' }
            : item
        )
      );
      return;
    }

    // Update task status on backend
    try {
      const newStatus = task.status === 'done' ? 'pending' : 'completed';
      await goalsAPI.updateTaskStatus(task.taskId, newStatus);
      
      // Update local state
      setRoadmapData(prevData =>
        prevData.map(item =>
          item.day === day
            ? { ...item, status: newStatus === 'completed' ? 'done' : 'pending' }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const completedCount = roadmapData.filter(item => item.status === 'done').length;
  const totalDays = roadmapData.length;
  const progressPercentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  const filteredRoadmap = roadmapData.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!userGoal) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Learning Plan Yet</h2>
        <p className="text-gray-600 mb-8">Create your first learning plan to get started!</p>
        <a 
          href="/dashboard/create-plan" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Your First Plan
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Roadmap</h1>
        <p className="text-gray-600">Track your progress through your personalized learning path.</p>
      </div>

      {/* Goal Info */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-sm text-indigo-100 mb-1">Current Goal</div>
            <h2 className="text-2xl font-bold mb-2">{userGoal.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                📖 {userGoal.level}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                ⏱️ {userGoal.time_per_day} hrs/day
              </span>
              {userGoal.deadline && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  📅 Ends: {new Date(userGoal.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{progressPercentage}%</div>
            <div className="text-sm text-indigo-100">Complete</div>
          </div>
        </div>
        <ProgressBar progress={progressPercentage} showPercentage={false} />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm mb-1">Total Days</div>
              <div className="text-3xl font-bold text-gray-900">{roadmapData.length}</div>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm mb-1">Remaining</div>
              <div className="text-3xl font-bold text-amber-600">{roadmapData.length - completedCount}</div>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-2 mb-6 inline-flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All ({roadmapData.length})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            filter === 'done'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pending ({roadmapData.length - completedCount})
        </button>
      </div>

      {/* Roadmap Cards */}
      <div className="space-y-4">
        {filteredRoadmap.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'done' ? 'No completed tasks yet' : 'No pending tasks'}
            </h3>
            <p className="text-gray-600">
              {filter === 'done' 
                ? 'Start completing your daily tasks to see them here!' 
                : 'Great job! You\'ve completed all your tasks!'}
            </p>
          </div>
        ) : (
          filteredRoadmap.map((item) => (
            <RoadmapCard
              key={item.day}
              day={item.day}
              topic={item.topic}
              status={item.status}
              duration={item.duration}
              taskId={item.taskId}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>

      {/* Motivational Footer */}
      {filteredRoadmap.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 text-center">
          <div className="text-3xl mb-3">💪</div>
          <p className="text-gray-700 font-medium">
            Keep pushing forward! Every completed task brings you closer to your goal.
          </p>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
