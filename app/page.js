'use client';

import { useState, useEffect } from 'react';
import NotebookSidebar from './components/NotebookSidebar';
import ChatInterface from './components/ChatInterface';
import ToolsPanel from './components/ToolsPanel';
import CreateNotebookModal from './components/CreateNotebookModal';
import MobileLayout from './components/MobileLayout';

export default function Home() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [sources, setSources] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  useEffect(() => {
    if (selectedNotebook) {
      fetchSources(selectedNotebook.id);
    }
  }, [selectedNotebook]);

  const fetchNotebooks = async () => {
    try {
      const response = await fetch('/api/notebooks');
      const data = await response.json();
      setNotebooks(data);
      if (data.length > 0 && !selectedNotebook) {
        setSelectedNotebook(data[0]);
      }
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async (notebookId) => {
    try {
      const response = await fetch(`/api/sources?notebookId=${notebookId}`);
      const data = await response.json();
      setSources(data);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const handleCreateNotebook = async (notebookData) => {
    try {
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notebookData),
      });
      
      if (response.ok) {
        const newNotebook = await response.json();
        setNotebooks(prev => [newNotebook, ...prev]);
        setSelectedNotebook(newNotebook);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating notebook:', error);
    }
  };

  const handleSourceAdded = () => {
    if (selectedNotebook) {
      fetchSources(selectedNotebook.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin-slow rounded-full h-16 w-16 border-4 border-primary/20 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Loading NotebookLM-lite</h2>
            <p className="text-muted-foreground">Preparing your AI-powered workspace...</p>
          </div>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-slow"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-slow" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-slow" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Layout - Actual Google NotebookLM Style */}
      <div className="hidden lg:flex h-screen bg-white dark:bg-gray-900">
        {/* Left Sidebar - Notebooks & Sources */}
        <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <NotebookSidebar
            notebooks={notebooks}
            selectedNotebook={selectedNotebook}
            onSelectNotebook={setSelectedNotebook}
            onCreateNotebook={() => setShowCreateModal(true)}
            sources={sources}
            onSourceAdded={handleSourceAdded}
          />
        </div>

        {/* Center - Chat Interface */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          <ChatInterface
            notebook={selectedNotebook}
            sources={sources}
          />
        </div>

        {/* Right Panel - Tools */}
        <div className="w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
          <ToolsPanel
            notebook={selectedNotebook}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileLayout
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          onSelectNotebook={setSelectedNotebook}
          onCreateNotebook={() => setShowCreateModal(true)}
          sources={sources}
          onSourceAdded={handleSourceAdded}
        />
      </div>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <CreateNotebookModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNotebook}
        />
      )}
    </>
  );
}
