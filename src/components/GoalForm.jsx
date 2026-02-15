import React, { useState } from 'react';

const GoalForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    goal: '',
    currentLevel: 'beginner',
    timePerDay: '',
    deadline: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      goal: '',
      currentLevel: 'beginner',
      timePerDay: '',
      deadline: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
      <div>
        <label htmlFor="goal" className="block text-sm font-semibold text-gray-700 mb-2">
          What do you want to learn?
        </label>
        <input
          type="text"
          id="goal"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          placeholder="e.g., Become a Frontend Developer"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          required
        />
      </div>

      <div>
        <label htmlFor="currentLevel" className="block text-sm font-semibold text-gray-700 mb-2">
          Current Level
        </label>
        <select
          id="currentLevel"
          name="currentLevel"
          value={formData.currentLevel}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          required
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label htmlFor="timePerDay" className="block text-sm font-semibold text-gray-700 mb-2">
          Time Available Per Day (hours)
        </label>
        <input
          type="number"
          id="timePerDay"
          name="timePerDay"
          value={formData.timePerDay}
          onChange={handleChange}
          placeholder="e.g., 2"
          min="0.5"
          max="12"
          step="0.5"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          required
        />
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
          Target Deadline
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
      >
        🚀 Generate My Learning Plan
      </button>
    </form>
  );
};

export default GoalForm;
