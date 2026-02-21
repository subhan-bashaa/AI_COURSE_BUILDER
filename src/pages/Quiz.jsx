import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../services/api';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Quiz() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, [taskId]);

  // Timer
  useEffect(() => {
    if (!submitted && quiz) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [submitted, quiz]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await lessonsAPI.getQuiz(taskId);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    try {
      const formattedAnswers = quiz.questions.map(q => ({
        quiz_id: q.id,
        answer: answers[q.id] || ''
      }));

      const response = await lessonsAPI.submitQuiz(taskId, formattedAnswers);
      setResults(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                results.score_percentage >= 80 ? 'bg-green-100' : 
                results.score_percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-3xl font-bold ${
                  results.score_percentage >= 80 ? 'text-green-600' :
                  results.score_percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(results.score_percentage)}%
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600">
                You got {results.correct_answers} out of {results.total_questions} correct
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FaClock />
                  <span>Time: {formatTime(timeElapsed)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assessment */}
          {results.assessment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">AI Suggestions</h2>
              <ul className="space-y-2">
                {results.assessment.ai_suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-blue-900">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Results */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Review Your Answers</h2>
            {results.results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                  result.is_correct ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                  {result.is_correct ? (
                    <FaCheckCircle className="text-green-600 text-xl" />
                  ) : (
                    <FaTimesCircle className="text-red-600 text-xl" />
                  )}
                </div>
                <p className="text-gray-700 mb-3">{result.question}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Your answer:</span>
                    <span className={`font-medium ${
                      result.is_correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.your_answer}
                    </span>
                  </div>
                  {!result.is_correct && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Correct answer:</span>
                      <span className="font-medium text-green-600">
                        {result.correct_answer}
                      </span>
                    </div>
                  )}
                </div>
                
                {result.explanation && (
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700">{result.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => navigate(`/learn/${taskId}`)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Review Lesson
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.topic} Quiz</h1>
              <p className="text-gray-600 mt-1">Answer all {quiz.questions.length} questions</p>
            </div>
            <div className="flex items-center space-x-2 text-lg font-semibold text-blue-600">
              <FaClock />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {index + 1} of {quiz.questions.length}
                  </h3>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{question.question}</p>
              </div>

              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      answers[question.id] === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleAnswerSelect(question.id, option)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.questions.length}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
