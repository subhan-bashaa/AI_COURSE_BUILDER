import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <Navbar isLanding={true} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block mb-6">
            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
              🚀 AI-Powered Learning
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your AI Learning
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Operating System
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Generate personalized course roadmaps, track progress, and achieve your learning goals with AI-powered guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Generate My Plan 🎯
            </Link>
            <Link 
              to="/login"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-indigo-200 hover:border-indigo-600 hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="font-semibold text-gray-800">Set Goals</div>
                </div>
                <div className="bg-gradient-to-br from-violet-100 to-violet-50 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <div className="font-semibold text-gray-800">Get Roadmap</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <div className="font-semibold text-gray-800">Track Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Choose SkillPilot AI?
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            The smartest way to learn anything, faster.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 border border-indigo-100">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-3xl mb-4">
                🤖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Personalization</h3>
              <p className="text-gray-600">
                Get custom learning paths tailored to your current level, time availability, and target deadline.
              </p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl p-8 border border-violet-100">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your learning streaks, consistency, and achievements with detailed analytics.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl p-8 border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Daily Task Management</h3>
              <p className="text-gray-600">
                Get clear daily objectives and break down complex skills into manageable steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Get started in 3 simple steps
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tell us your goal</h3>
                <p className="text-gray-600">
                  Share what you want to learn, your current level, available time, and deadline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get your personalized roadmap</h3>
                <p className="text-gray-600">
                  Our AI generates a day-by-day learning plan optimized for your schedule.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Track and achieve</h3>
                <p className="text-gray-600">
                  Follow your daily tasks, track progress, and reach your learning goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to accelerate your learning?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of learners achieving their goals with SkillPilot AI
          </p>
          <Link 
            to="/register"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Get Started for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2026 SkillPilot AI. Build your future, one day at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
