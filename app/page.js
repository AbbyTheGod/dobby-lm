'use client';

import { useState, useEffect } from 'react';
import NotebookSidebar from './components/NotebookSidebar';
import ChatInterface from './components/ChatInterface';
import ToolsPanel from './components/ToolsPanel';
import CreateNotebookModal from './components/CreateNotebookModal';
import AddSourceModal from './components/AddSourceModal';
import MobileLayout from './components/MobileLayout';
import ErrorBoundary from './components/ErrorBoundary';

export default function Home() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [sources, setSources] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
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
      // Ensure loading animation is visible for at least 1 second
      const startTime = Date.now();
      
      const response = await fetch('/api/notebooks');
      const data = await response.json();
      
      // Check if the response is an error or not an array
      if (!response.ok || !Array.isArray(data)) {
        console.error('Error fetching notebooks:', data);
        setNotebooks([]);
        return;
      }
      
      setNotebooks(data);
      if (data.length > 0 && !selectedNotebook) {
        setSelectedNotebook(data[0]);
      }
      
      // Ensure minimum loading time for animation visibility
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 500; // 0.5 seconds
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
    } catch (error) {
      console.error('Error fetching notebooks:', error);
      setNotebooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async (notebookId) => {
    try {
      const response = await fetch(`/api/sources?notebookId=${notebookId}`);
      const data = await response.json();
      
      // Check if the response is an error or not an array
      if (!response.ok || !Array.isArray(data)) {
        console.error('Error fetching sources:', data);
        setSources([]);
        return;
      }
      
      setSources(data);
    } catch (error) {
      console.error('Error fetching sources:', error);
      setSources([]);
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

  const handleSourceDeleted = async (sourceId) => {
    try {
      console.log('🗑️ Frontend: Attempting to delete source:', sourceId);
      const response = await fetch(`/api/sources?sourceId=${sourceId}`, {
        method: 'DELETE',
      });
      
      console.log('🗑️ Frontend: Delete response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Frontend: Source deleted successfully:', result);
        // Refresh sources list
        if (selectedNotebook) {
          fetchSources(selectedNotebook.id);
        }
      } else {
        const error = await response.json();
        console.error('❌ Frontend: Error deleting source:', error);
        alert(`Failed to delete source: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Frontend: Error deleting source:', error);
      alert(`Failed to delete source: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-16 h-16">
            <div className="animate-spin-slow rounded-full h-16 w-16 border-4 border-primary/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary absolute top-0 left-0"></div>
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
    <ErrorBoundary>
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
            onSourceDeleted={handleSourceDeleted}
            showAddSource={showAddSourceModal}
            setShowAddSource={setShowAddSourceModal}
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
          onSourceDeleted={handleSourceDeleted}
        />
      </div>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <CreateNotebookModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNotebook}
        />
      )}

    </ErrorBoundary>
  );
}
