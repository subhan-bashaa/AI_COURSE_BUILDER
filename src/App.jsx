import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import Roadmap from './pages/Roadmap';
import AnalyticsPage from './pages/Analytics';
import LearnInteractive from './pages/LearnInteractive';
import Quiz from './pages/Quiz';
import DashboardLayout from './layout/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ChatWidget />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Interactive Learning Routes (Full Screen) */}
          <Route path="/learn/:taskId" element={<ProtectedRoute><LearnInteractive /></ProtectedRoute>} />
          <Route path="/quiz/:taskId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          
          {/* Dashboard routes with sidebar layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="create-plan" element={<CreatePlan />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
