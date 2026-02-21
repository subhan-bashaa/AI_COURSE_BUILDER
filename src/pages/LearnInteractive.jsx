import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../services/api';
import CodeEditor from '../components/CodeEditor';
import { FaVideo, FaBook, FaCheckCircle, FaGlobe } from 'react-icons/fa';

export default function LearnInteractive() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [task, setTask] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    loadLesson();
  }, [taskId]);

  // Update video when language changes
  useEffect(() => {
    if (task && task.topic) {
      updateVideoForLanguage();
    }
  }, [selectedLanguage, task]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await lessonsAPI.getLesson(taskId);
      const taskData = response.data.task;
      const lessonData = response.data.lesson;
      
      setTask(taskData);
      setLesson(lessonData);
      
      // Auto-select first video resource
      if (lessonData.resources && lessonData.resources.length > 0) {
        const firstVideo = lessonData.resources.find(r => r.resource_type === 'video');
        setSelectedResource(firstVideo || lessonData.resources[0]);
      }
      
      // Set initial video URL based on default language using the loaded task
      if (taskData && taskData.topic) {
        const searchQuery = `${taskData.topic} tutorial CodeWithHarry english`;
        const encodedQuery = encodeURIComponent(searchQuery);
        setVideoUrl(`https://www.youtube.com/embed?listType=search&list=${encodedQuery}`);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      alert('Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  };

  const updateVideoForLanguage = () => {
    if (!task || !task.topic) return;
    
    const topic = task.topic.toLowerCase();
    
    // Topic-specific video mappings for different languages
    const videoMappings = {
      english: {
        // HTML Topics
        'html basics': 'UB1O30fR-EE',
        'semantic': 'kGW8Al_cga4',
        'html forms': 'fNcJuPIZ2WE',
        'form': 'fNcJuPIZ2WE',
        'validation': '7TbW0Wq3P4A',
        'html5 api': 'rn5ppfLzzxU',
        'html5': 'rn5ppfLzzxU',
        
        // CSS Topics
        'css fundamentals': 'Edsxf_NBDmU',
        'css basics': 'Edsxf_NBDmU',
        'selectors': 'l1mER1bV0N0',
        'css selector': 'l1mER1bV0N0',
        'preprocessor': 'akDIJa0AP5c', // SASS/LESS Preprocessors
        'sass': 'akDIJa0AP5c',
        'less': 'akDIJa0AP5c',
        'flexbox': 'K74l26pE4YA',
        'flex': 'K74l26pE4YA',
        'grid': 'EFafSYg-PkI',
        'css grid': 'EFafSYg-PkI',
        'animation': 'zHUpx90NerM',
        'transition': 'zHUpx90NerM',
        'responsive': 'srvUrASNj0s',
        'media queries': 'srvUrASNj0s',
        
        // JavaScript Topics
        'javascript': 'W6NZfCO5SIk',
        'js': 'W6NZfCO5SIk',
        'dom': 'y17RuWkWdn8',
        'async': '8aGhZQkoFbQ',
        'promise': '8aGhZQkoFbQ',
        'fetch': 'cuEtnrL9-H0',
        
        // Framework Topics  
        'react': 'RGKi6LSPDLU',
        'vue': 'qZXt1Aom3Cs',
        'angular': '3qBXWUpoPHo',
        'node': 'TlB_eWDSMt4',
        
        // Tools & Others
        'bootstrap': 'vpAJ0s5S2t0',
        'tailwind': 'ft30zcMlFao',
        'git': 'apGV9Kg7ics',
        'webpack': 'IZGNcSuwBZs',
        
        'default': 'UB1O30fR-EE' // HTML Crash Course
      },
      hindi: {
        // HTML Topics (CodeWithHarry Hindi - verified working IDs)
        'html basics': 'BsDoLVMnmZs', // Web Dev Course Hindi
        'semantic': 'BsDoLVMnmZs',
        'html forms': 'BsDoLVMnmZs',
        'form': 'BsDoLVMnmZs',
        'html5': 'BsDoLVMnmZs',
        
        // CSS Topics (Hindi)
        'css fundamentals': 'Edsxf_NBDmU',
        'css basics': 'Edsxf_NBDmU',
        'selectors': 'Edsxf_NBDmU',
        'preprocessor': '_a5j7KoflTs', // SASS Hindi Tutorial
        'sass': '_a5j7KoflTs',
        'less': '_a5j7KoflTs',
        'flexbox': 'pjBFIzPV_wc', // Flexbox Hindi
        'flex': 'pjBFIzPV_wc',
        'grid': 'pjBFIzPV_wc',
        'responsive': 'Edsxf_NBDmU',
        
        // JavaScript (Hindi)
        'javascript': 'hKB-YGF14SY', // JS Course Hindi
        'js': 'hKB-YGF14SY',
        'dom': 'hKB-YGF14SY',
        
        // Frameworks (Hindi)
        'react': 'RGKi6LSPDLU', // React Hindi
        'bootstrap': 'vpAJ0s5S2t0',
        
        'default': 'BsDoLVMnmZs' // Web Dev Hindi
      },
      telugu: {
        // Telugu - Using English videos as Telugu tech content with embedding is limited
        // HTML Topics
        'html basics': 'UB1O30fR-EE',
        'html': 'UB1O30fR-EE',
        'semantic': 'kGW8Al_cga4',
        'form': 'fNcJuPIZ2WE',
        'html5': 'rn5ppfLzzxU',
        
        // CSS Topics
        'css fundamentals': 'Edsxf_NBDmU',
        'css': 'Edsxf_NBDmU',
        'selectors': 'l1mER1bV0N0',
        'preprocessor': 'akDIJa0AP5c',
        'sass': 'akDIJa0AP5c',
        'flexbox': 'K74l26pE4YA',
        'flex': 'K74l26pE4YA',
        'grid': 'EFafSYg-PkI',
        'animation': 'zHUpx90NerM',
        'responsive': 'srvUrASNj0s',
        
        // JavaScript Topics
        'javascript': 'W6NZfCO5SIk',
        'js': 'W6NZfCO5SIk',
        'dom': 'y17RuWkWdn8',
        
        // Frameworks
        'react': 'RGKi6LSPDLU',
        'bootstrap': 'vpAJ0s5S2t0',
        
        'default': 'UB1O30fR-EE' // HTML Course
      }
    };
    
    // Find matching video ID based on topic keywords
    let videoId = videoMappings[selectedLanguage].default;
    let foundMatch = false;
    
    for (const [keyword, id] of Object.entries(videoMappings[selectedLanguage])) {
      if (topic.includes(keyword) && keyword !== 'default') {
        videoId = id;
        foundMatch = true;
        break;
      }
    }
    
    // Fallback to English if Hindi/Telugu video not found for specific topic
    if (!foundMatch && selectedLanguage !== 'english') {
      for (const [keyword, id] of Object.entries(videoMappings.english)) {
        if (topic.includes(keyword) && keyword !== 'default') {
          videoId = id;
          break;
        }
      }
    }
    
    // Use standard YouTube embed with autoplay and controls
    setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const startQuiz = () => {
    setShowQuiz(true);
    navigate(`/quiz/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Lesson not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{task.topic}</h1>
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-4 mx-6">
            <FaGlobe className="text-gray-600" />
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="english">🇬🇧 English</option>
              <option value="hindi">🇮🇳 Hindi</option>
              <option value="telugu">🇮🇳 Telugu</option>
            </select>
          </div>
          
          <button
            onClick={startQuiz}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
          >
            <FaCheckCircle />
            <span>Take Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Video & Lesson Content */}
        <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
          {/* Video Player */}
          <div className="aspect-video bg-black relative">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${task.topic} - ${selectedLanguage} tutorial`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <FaVideo className="text-6xl mb-4 mx-auto opacity-50" />
                  <p className="text-lg">Loading video...</p>
                </div>
              </div>
            )}
            
            {/* Language Badge */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
              {selectedLanguage === 'english' ? '🇬🇧 English' : 
               selectedLanguage === 'hindi' ? '🇮🇳 Hindi' : '🇮🇳 Telugu (English)'}
            </div>
          </div>

          {/* Telugu Language Info Banner */}
          {selectedLanguage === 'telugu' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mx-4 mt-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">ℹ️ Note:</span> Telugu tech tutorials with embedding are limited. 
                Showing English videos for better quality. You can enable English subtitles in the video player.
              </p>
            </div>
          )}

          {/* Lesson Content */}
          <div className="p-6">
            {/* Today's Topic Header */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📚 Day {task.day_number || 1}: {task.topic}
              </h2>
              <p className="text-sm text-gray-600">
                Estimated Time: {task.estimated_time || '45 minutes'} | Language: {
                  selectedLanguage === 'english' ? 'English' : 
                  selectedLanguage === 'hindi' ? 'हिंदी (Hindi)' : 'English (Telugu content limited)'
                }
              </p>
            </div>

            {/* Detailed Lesson Explanation */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📖</span>
                Detailed Explanation
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4 text-justify">
                  {lesson.explanation}
                </p>
                
                {/* Additional Context */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">What You'll Learn Today:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    In this lesson, we'll dive deep into {task.topic}. You'll understand the core concepts,
                    see practical examples, and learn how to apply these skills in real-world scenarios.
                    By the end of this session, you'll have hands-on experience and be ready to implement
                    what you've learned in your projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Key Concepts to Master
              </h3>
              <ul className="space-y-3">
                {lesson.key_concepts.map((concept, index) => (
                  <li key={index} className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <span className="text-green-600 mt-1 font-bold">{index + 1}.</span>
                    <span className="text-gray-700 flex-1">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Resources by Language */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🎥</span>
                Video Tutorials ({selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)})
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Current Video:</strong> {task.topic} tutorial in {selectedLanguage}
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Watch the complete tutorial video above
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Follow along with the code examples
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Practice in the code editor on the right
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Switch languages using the selector above
                  </li>
                </ul>
              </div>
            </div>

            {/* Learning Resources */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📚</span>
                Additional Resources
              </h3>
              <div className="space-y-2">
                {lesson.resources?.map((resource, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResource(resource)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedResource?.id === resource.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {resource.resource_type === 'video' ? (
                        <FaVideo className="text-red-600" />
                      ) : (
                        <FaBook className="text-green-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{resource.title}</p>
                        <p className="text-sm text-gray-500">{resource.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Example Code */}
            {lesson.example_code && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">💻</span>
                  Example Code
                </h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
                  <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 flex items-center justify-between">
                    <span>📝 {lesson.programming_language || 'Code'}</span>
                    <span className="text-xs">Copy this to the editor →</span>
                  </div>
                  <pre className="text-green-400 p-4 overflow-x-auto">
                    <code>{lesson.example_code}</code>
                  </pre>
                </div>
                <p className="text-sm text-gray-600 mt-2 italic">
                  💡 Try running this code in the editor on the right panel!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 bg-gray-900 p-4">
          <CodeEditor
            language={lesson.programming_language || 'python'}
            initialCode={lesson.example_code || '# Write your code here\n'}
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to convert YouTube URLs to embed format
function getEmbedUrl(url) {
  if (!url) return '';
  
  // Handle YouTube watch URLs
  if (url.includes('youtube.com/watch')) {
    const videoId = new URLSearchParams(new URL(url).search).get('v');
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Handle YouTube short URLs
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Handle YouTube search results - open in new tab instead
  if (url.includes('youtube.com/results')) {
    window.open(url, '_blank');
    return '';
  }
  
  // Return as-is for other URLs (already embed format)
  return url;
}
