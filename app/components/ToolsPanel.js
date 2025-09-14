'use client';

import { useState, useEffect } from 'react';
import FlashcardViewer from './FlashcardViewer';
import QuizViewer from './QuizViewer';
import BriefingViewer from './BriefingViewer';

export default function ToolsPanel({ notebook }) {
  const [activeTab, setActiveTab] = useState('flashcards');
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (notebook) {
      fetchStudyTools();
    }
  }, [notebook]);

  const fetchStudyTools = async () => {
    if (!notebook) return;

    try {
      setLoading(true);
      const [flashcardsRes, quizzesRes, briefingsRes] = await Promise.all([
        fetch(`/api/flashcards?notebookId=${notebook.id}`),
        fetch(`/api/quiz?notebookId=${notebook.id}`),
        fetch(`/api/briefing?notebookId=${notebook.id}`),
      ]);

      if (flashcardsRes.ok) {
        const data = await flashcardsRes.json();
        setFlashcards(data);
      }

      if (quizzesRes.ok) {
        const data = await quizzesRes.json();
        setQuizzes(data);
      }

      if (briefingsRes.ok) {
        const data = await briefingsRes.json();
        setBriefings(data);
      }
    } catch (error) {
      console.error('Error fetching study tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTool = async (type) => {
    if (!notebook) return;

    try {
      setLoading(true);
      const endpoint = type === 'briefing' ? '/api/briefing' : `/api/${type}`;
      
      console.log(`🔧 Generating ${type} for notebook ${notebook.id}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId: notebook.id }),
      });

      console.log(`📊 ${type} API response status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${type} generated successfully:`, data);
        
        if (type === 'flashcards') {
          setFlashcards(prev => [data, ...prev]);
        } else if (type === 'quiz') {
          setQuizzes(prev => [data, ...prev]);
        } else if (type === 'briefing') {
          setBriefings(prev => [data, ...prev]);
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ ${type} API error:`, errorData);
        alert(`Failed to generate ${type}: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`❌ Error generating ${type}:`, error);
      alert(`Failed to generate ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!notebook) {
    return (
      <div className="flex items-center justify-center h-full bg-secondary-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-secondary-700 mb-2">
            Study Tools
          </h2>
          <p className="text-secondary-500">
            Select a notebook to access study tools
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'flashcards', label: 'Flashcards', count: flashcards.length },
    { id: 'quiz', label: 'Quiz', count: quizzes.length },
    { id: 'briefing', label: 'Briefing', count: briefings.length },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Study Tools
        </h2>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-secondary-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-xs bg-secondary-200 text-secondary-700 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'flashcards' && (
          <FlashcardViewer
            flashcards={flashcards}
            onGenerate={() => generateTool('flashcards')}
            loading={loading}
          />
        )}
        
        {activeTab === 'quiz' && (
          <QuizViewer
            quizzes={quizzes}
            onGenerate={() => generateTool('quiz')}
            loading={loading}
          />
        )}
        
        {activeTab === 'briefing' && (
          <BriefingViewer
            briefings={briefings}
            onGenerate={() => generateTool('briefing')}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
