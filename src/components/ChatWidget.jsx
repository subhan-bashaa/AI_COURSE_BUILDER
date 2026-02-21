/**
 * AI Chat Widget Component
 * Floating chat interface for AI assistant
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI, handleAPIError } from '../services/api';

const ChatWidget = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await aiAPI.getChatHistory(50);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to UI immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      const response = await aiAPI.chat(userMessage);
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        created_at: response.data.timestamp
      }]);
    } catch (error) {
      const errorMsg = handleAPIError(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Clear all chat history?')) return;

    try {
      await aiAPI.clearChatHistory();
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">SkillPilot AI Assistant</h3>
              <p className="text-sm text-indigo-100">Always here to help you learn</p>
            </div>
            <button
              onClick={handleClearChat}
              className="text-indigo-100 hover:text-white transition-colors"
              title="Clear chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-lg mb-2">👋 Hello!</p>
                <p className="text-sm">Ask me anything about learning, programming, or how to use SkillPilot!</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
