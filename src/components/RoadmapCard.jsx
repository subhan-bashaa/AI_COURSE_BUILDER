import React from 'react';

const RoadmapCard = ({ day, topic, status, duration, onToggleStatus }) => {
  const isDone = status === 'done';

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border-l-4 ${
      isDone ? 'border-green-500' : 'border-indigo-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Day {day}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isDone 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {isDone ? '✓ Completed' : '○ Pending'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic}</h3>
          <p className="text-sm text-gray-600">
            ⏱️ Duration: <span className="font-medium">{duration}</span>
          </p>
        </div>
        <button
          onClick={() => onToggleStatus(day)}
          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDone
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isDone ? 'Undo' : 'Complete'}
        </button>
      </div>
    </div>
  );
};

export default RoadmapCard;
