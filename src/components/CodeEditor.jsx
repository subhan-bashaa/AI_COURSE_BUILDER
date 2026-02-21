import { useState } from 'react';

export default function CodeEditor({ language = 'python', initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // For now, just simulate code execution
      // In production, integrate with Judge0 API or similar
      setTimeout(() => {
        setOutput(`Code executed successfully!\n\nResult:\nYour code for ${language} has been simulated.\n\nIn production, this would connect to a code execution service.`);
        setIsRunning(false);
      }, 1500);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(initialCode);
    setOutput('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">Code Editor</span>
          <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetCode}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition"
          >
            Reset
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 p-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-gray-800 text-green-400 font-mono text-sm p-4 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Write your code here..."
          spellCheck="false"
        />
      </div>

      {/* Output Terminal */}
      {output && (
        <div className="border-t border-gray-700 bg-black">
          <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 font-semibold">
            OUTPUT
          </div>
          <pre className="p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
