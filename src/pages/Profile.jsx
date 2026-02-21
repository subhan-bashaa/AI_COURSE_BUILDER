/**
 * User Profile Page Component
 * Displays user information, statistics, and profile management
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, handleAPIError } from '../services/api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, setUser, refreshAccessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  // Fetch profile stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.getStats();
      setStats(response.data.statistics);
      setFormData({
        username: response.data.user.username,
        email: response.data.user.email
      });
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await profileAPI.updateProfile(formData);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setError(null);
      const response = await profileAPI.uploadAvatar(file);
      setUser(response.data.user);
      setSuccess('Avatar uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;

    try {
      await profileAPI.deleteAvatar();
      setUser(prev => ({ ...prev, profile_picture_url: null }));
      setSuccess('Avatar deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-full">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            {success}
          </div>
        )}

        {/* Profile Header - Avatar and Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              {user?.profile_picture_url ? (
                <img
                  src={`http://localhost:8000${user.profile_picture_url}`}
                  alt={user.username}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-indigo-200 dark:border-indigo-600 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-5xl">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Avatar Upload */}
              <label className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium">
                {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
              </label>

              {user?.profile_picture_url && (
                <button
                  onClick={handleDeleteAvatar}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Delete Avatar
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {user?.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{user?.email}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stats?.total_goals || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Goals</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {stats?.total_completed_tasks || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats?.current_streak || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.longest_streak || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              {isEditMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditMode ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {stats?.account_age_days} days
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Progress</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average Completion</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 h-3 rounded-full"
                    style={{
                      width: `${stats?.average_completion_percentage || 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  {stats?.average_completion_percentage || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Achievements</h3>
            <div className="space-y-3">
              {stats?.longest_streak > 0 && (
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🔥</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.longest_streak}-Day Streak
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your longest streak</p>
                  </div>
                </div>
              )}
              {stats?.total_completed_tasks > 0 && (
                <div className="flex items-center">
                  <span className="text-3xl mr-3">✅</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.total_completed_tasks} Tasks Completed
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Keep up the great work!</p>
                  </div>
                </div>
              )}
              {stats?.total_goals > 0 && (
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.total_goals} Goals Active
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You're on your way!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
