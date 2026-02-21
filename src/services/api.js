/**
 * API Service for SkillPilot AI (Production-Ready)
 * Handles all backend API calls with JWT authentication and error handling
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track token refresh to prevent multiple simultaneous requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

/**
 * Request interceptor - Attach JWT token automatically
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token refresh and errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/token/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Auth API Endpoints
 */
export const authAPI = {
  register: (username, email, password) =>
    apiClient.post('/register', { username, email, password }),

  login: (username, password) =>
    apiClient.post('/login', { username, password }),

  logout: () =>
    apiClient.post('/logout'),

  refreshToken: () =>
    apiClient.post('/token/refresh')
};

/**
 * Goals API Endpoints
 */
export const goalsAPI = {
  listGoals: (params = {}) =>
    apiClient.get('/goals', { params }),

  createGoal: (goalData) =>
    apiClient.post('/goals', goalData),

  getGoal: (goalId) =>
    apiClient.get(`/goals/${goalId}`),

  updateGoal: (goalId, goalData) =>
    apiClient.put(`/goals/${goalId}`, goalData),

  deleteGoal: (goalId) =>
    apiClient.delete(`/goals/${goalId}`),

  listTasks: (goalId, params = {}) =>
    apiClient.get(`/goals/${goalId}/tasks`, { params }),

  updateTaskStatus: (taskId, status) =>
    apiClient.patch(`/tasks/${taskId}/update-status`, { status }),

  getProgress: (goalId) =>
    apiClient.get(`/goals/${goalId}/progress`)
};

/**
 * Profile API Endpoints
 */
export const profileAPI = {
  getProfile: () =>
    apiClient.get('/profile'),

  updateProfile: (profileData) =>
    apiClient.put('/profile', profileData),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/profile/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteAvatar: () =>
    apiClient.post('/profile/delete-avatar'),

  getStats: () =>
    apiClient.get('/profile/stats')
};

/**
 * Analytics API Endpoints
 */
export const analyticsAPI = {
  getGoalAnalytics: (goalId) =>
    apiClient.get(`/goals/${goalId}/analytics`),

  getGoalInsights: (goalId) =>
    apiClient.get(`/goals/${goalId}/insights`),

  getWeeklyProgress: (goalId) =>
    apiClient.get(`/goals/${goalId}/weekly-progress`),

  getDailyBreakdown: (goalId) =>
    apiClient.get(`/goals/${goalId}/daily-breakdown`),

  getComparison: (goalId) =>
    apiClient.get(`/goals/${goalId}/comparison`),

  getDashboardOverview: () =>
    apiClient.get('/dashboard/overview')
};

/**
 * AI API Endpoints
 */
export const aiAPI = {
  chat: (message) =>
    apiClient.post('/ai/chat', { message }),

  getChatHistory: (limit = 50) =>
    apiClient.get('/ai/chat/history', { params: { limit } }),

  clearChatHistory: () =>
    apiClient.post('/ai/chat/clear'),

  simplifyConcept: (concept, level = 'beginner') =>
    apiClient.post('/ai/simplify', { concept, level }),

  generateExample: (topic, language = 'javascript') =>
    apiClient.post('/ai/generate-example', { topic, language })
};

/**
 * Lessons API Endpoints (Interactive Learning)
 */
export const lessonsAPI = {
  getLesson: (taskId) =>
    apiClient.get(`/lessons/task/${taskId}`),

  generateLesson: (taskId) =>
    apiClient.post(`/lessons/task/${taskId}/generate`),

  getQuiz: (taskId) =>
    apiClient.get(`/lessons/task/${taskId}/quiz`),

  submitQuiz: (taskId, answers) =>
    apiClient.post(`/lessons/task/${taskId}/quiz/submit`, { answers }),

  getAssessment: (taskId) =>
    apiClient.get(`/lessons/task/${taskId}/assessment`)
};

/**
 * Utility function to handle API errors with user-friendly messages
 */
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.error || error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred';
  }
};

export default apiClient;
