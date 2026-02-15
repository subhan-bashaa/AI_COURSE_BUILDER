import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalForm from '../components/GoalForm';

const CreatePlan = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleFormSubmit = (formData) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedPlan({
        goal: formData.goal,
        level: formData.currentLevel,
        timePerDay: formData.timePerDay,
        deadline: formData.deadline,
        totalDays: 15,
        estimatedHours: 30
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleSavePlan = () => {
    // In a real app, save to backend
    navigate('/dashboard/roadmap');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Learning Plan</h1>
        <p className="text-gray-600">Tell us about your goals and we'll generate a personalized roadmap.</p>
      </div>

      {/* AI Badge */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-violet-100 border border-indigo-200 px-4 py-2 rounded-full">
          <span className="text-xl">🤖</span>
          <span className="text-sm font-semibold text-indigo-700">AI-Powered Personalization</span>
        </div>
      </div>

      {/* Form */}
      {!generatedPlan && (
        <GoalForm onSubmit={handleFormSubmit} />
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Your Plan... 🚀</h3>
          <p className="text-gray-600">Our AI is analyzing your goals and creating a personalized roadmap.</p>
        </div>
      )}

      {/* Generated Plan Preview */}
      {generatedPlan && !isGenerating && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✅</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Plan Generated Successfully!</h3>
                <p className="text-gray-700 mb-4">
                  Your personalized learning roadmap is ready. Here's what we prepared for you:
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Plan Overview</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="text-sm text-gray-600 mb-1">Goal</div>
                <div className="font-bold text-gray-900">{generatedPlan.goal}</div>
              </div>
              
              <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
                <div className="text-sm text-gray-600 mb-1">Current Level</div>
                <div className="font-bold text-gray-900 capitalize">{generatedPlan.level}</div>
              </div>
              
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
                <div className="text-sm text-gray-600 mb-1">Daily Commitment</div>
                <div className="font-bold text-gray-900">{generatedPlan.timePerDay}</div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <div className="text-sm text-gray-600 mb-1">Target Deadline</div>
                <div className="font-bold text-gray-900">{new Date(generatedPlan.deadline).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 p-6 bg-gray-50 rounded-lg mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{generatedPlan.totalDays}</div>
                <div className="text-sm text-gray-600">Total Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-600 mb-1">{generatedPlan.estimatedHours}h</div>
                <div className="text-sm text-gray-600">Estimated Hours</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-bold text-gray-900">Your roadmap includes:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Day-by-day learning topics tailored to your level</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Hands-on projects and practical exercises</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Curated resources and learning materials</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Progress tracking and analytics</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSavePlan}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Save & Start Learning 🚀
              </button>
              <button
                onClick={() => setGeneratedPlan(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      {!generatedPlan && !isGenerating && (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">Personalized</h3>
            <p className="text-sm text-gray-600">
              Every plan is unique and tailored to your specific goals and timeline.
            </p>
          </div>
          
          <div className="bg-violet-50 rounded-lg p-6 border border-violet-100">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-bold text-gray-900 mb-2">Fast Generation</h3>
            <p className="text-sm text-gray-600">
              Get your complete roadmap in seconds, powered by advanced AI.
            </p>
          </div>
          
          <div className="bg-cyan-50 rounded-lg p-6 border border-cyan-100">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="font-bold text-gray-900 mb-2">Flexible</h3>
            <p className="text-sm text-gray-600">
              Adjust your plan anytime as your schedule or goals change.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePlan;
