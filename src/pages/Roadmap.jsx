import React, { useState } from 'react';
import RoadmapCard from '../components/RoadmapCard';
import ProgressBar from '../components/ProgressBar';
import { roadmap as initialRoadmap, userGoals } from '../data/dummyData';

const Roadmap = () => {
  const [roadmapData, setRoadmapData] = useState(initialRoadmap);
  const [filter, setFilter] = useState('all'); // all, done, pending

  const completedCount = roadmapData.filter(item => item.status === 'done').length;
  const progressPercentage = Math.round((completedCount / roadmapData.length) * 100);

  const handleToggleStatus = (day) => {
    setRoadmapData(prevData =>
      prevData.map(item =>
        item.day === day
          ? { ...item, status: item.status === 'done' ? 'pending' : 'done' }
          : item
      )
    );
  };

  const filteredRoadmap = roadmapData.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

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
            <h2 className="text-2xl font-bold mb-2">{userGoals[0].title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                📖 {userGoals[0].currentLevel}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                ⏱️ {userGoals[0].timePerDay}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                📅 Ends: {new Date(userGoals[0].deadline).toLocaleDateString()}
              </span>
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
