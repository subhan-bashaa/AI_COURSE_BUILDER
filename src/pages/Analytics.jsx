import React from 'react';
import DashboardCard from '../components/DashboardCard';
import ProgressBar from '../components/ProgressBar';
import { analyticsData, userProgress } from '../data/dummyData';

const Analytics = () => {
  const weeklyProgressPercentage = Math.round((analyticsData.weeklyAchieved / analyticsData.weeklyGoal) * 100);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your learning performance and consistency.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Hours"
          value={`${analyticsData.totalHours}h`}
          icon="📚"
          gradient="from-indigo-500 to-violet-500"
          subtitle="All time"
        />
        <DashboardCard
          title="Completed Topics"
          value={analyticsData.completedTopics}
          icon="✅"
          gradient="from-green-500 to-emerald-500"
          subtitle={`${analyticsData.pendingTopics} pending`}
        />
        <DashboardCard
          title="Avg Hours/Day"
          value={`${analyticsData.avgHoursPerDay}h`}
          icon="📊"
          gradient="from-cyan-500 to-blue-500"
          subtitle="Last 7 days"
        />
        <DashboardCard
          title="Consistency"
          value={`${analyticsData.consistency}%`}
          icon="🔥"
          gradient="from-orange-500 to-red-500"
          subtitle="This week"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📈 Weekly Progress</h2>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Weekly Goal Progress</span>
                <span className="text-sm font-semibold text-indigo-600">
                  {analyticsData.weeklyAchieved}h / {analyticsData.weeklyGoal}h
                </span>
              </div>
              <ProgressBar progress={weeklyProgressPercentage} showPercentage={false} />
            </div>

            <div className="space-y-4">
              {userProgress.weeklyProgress.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full rounded-lg flex items-center px-4 text-white font-semibold text-sm ${
                          day.completed
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600'
                            : 'bg-gray-200'
                        }`}
                        style={{ width: day.completed ? `${(day.hours / 3) * 100}%` : '0%' }}
                      >
                        {day.hours > 0 && `${day.hours}h`}
                      </div>
                    </div>
                  </div>
                  <div className="w-12 text-right">
                    {day.completed ? (
                      <span className="text-green-600 text-xl">✓</span>
                    ) : (
                      <span className="text-gray-300 text-xl">○</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📅 Monthly Overview</h2>
            
            <div className="grid grid-cols-4 gap-4">
              {analyticsData.monthlyStats.map((week, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm text-gray-600 mb-3">{week.week}</div>
                  <div className="space-y-2">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-700">{week.completed}</div>
                      <div className="text-xs text-green-600 font-medium">Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-amber-700">{week.pending}</div>
                      <div className="text-xs text-amber-600 font-medium">Pending</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🎯 Completion Rate</h2>
            
            <div className="flex items-center justify-center gap-8">
              {/* Pie Chart Representation */}
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="20"
                    strokeDasharray={`${(analyticsData.completedTopics / (analyticsData.completedTopics + analyticsData.pendingTopics)) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.round((analyticsData.completedTopics / (analyticsData.completedTopics + analyticsData.pendingTopics)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-600 to-violet-600"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Completed</div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.completedTopics}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gray-300"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Pending</div>
                    <div className="text-2xl font-bold text-amber-600">{analyticsData.pendingTopics}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Insights */}
        <div className="lg:col-span-1 space-y-6">
          {/* Performance Badge */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="text-4xl mb-3 text-center">🏆</div>
            <h3 className="text-xl font-bold text-center mb-2">Great Consistency!</h3>
            <p className="text-center text-green-50 text-sm">
              You've maintained a {analyticsData.consistency}% consistency rate this week!
            </p>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">📊 This Week</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Hours Learned</span>
                  <span className="text-sm font-bold text-gray-900">{analyticsData.weeklyAchieved}h</span>
                </div>
                <ProgressBar 
                  progress={weeklyProgressPercentage} 
                  showPercentage={false}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="text-lg font-bold text-indigo-600">3/7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Topics Completed</span>
                  <span className="text-lg font-bold text-green-600">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">💡 Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">📈</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Your learning pace is <strong>consistent</strong>. Keep it up!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">⚡</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Try to increase daily hours to reach your goal faster.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    You're on track to complete your goal on time!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <h3 className="font-bold text-gray-900 mb-4">🏅 Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xs text-gray-600">3 Day<br/>Streak</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center opacity-50">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs text-gray-600">7 Day<br/>Streak</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center opacity-50">
                <div className="text-2xl mb-1">🌟</div>
                <div className="text-xs text-gray-600">30 Day<br/>Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
