'use client';

import { useState } from 'react';
import NotebookSidebar from './NotebookSidebar';
import ChatInterface from './ChatInterface';
import ToolsPanel from './ToolsPanel';

export default function MobileLayout({ 
  notebooks, 
  selectedNotebook, 
  onSelectNotebook, 
  onCreateNotebook,
  sources,
  onSourceAdded,
  onSourceDeleted,
  deletingSourceId
}) {
  const [activeView, setActiveView] = useState('chat'); // 'sidebar', 'chat', 'tools'

  const views = {
    sidebar: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: 'Notebooks'
    },
    chat: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'Chat'
    },
    tools: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: 'Tools'
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">DobbyLM</h1>
            <p className="text-xs text-muted-foreground">AI-powered workspace</p>
          </div>
        </div>
        <button
          onClick={onCreateNotebook}
          className="btn-primary text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>

      {/* Active View */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'sidebar' && (
          <div className="h-full">
            <NotebookSidebar
              notebooks={notebooks}
              selectedNotebook={selectedNotebook}
              onSelectNotebook={(notebook) => {
                onSelectNotebook(notebook);
                setActiveView('chat');
              }}
              onCreateNotebook={onCreateNotebook}
              sources={sources}
              onSourceAdded={onSourceAdded}
              onSourceDeleted={onSourceDeleted}
              deletingSourceId={deletingSourceId}
            />
          </div>
        )}
        
        {activeView === 'chat' && (
          <div className="h-full">
            <ChatInterface
              notebook={selectedNotebook}
              sources={sources}
            />
          </div>
        )}
        
        {activeView === 'tools' && (
          <div className="h-full">
            <ToolsPanel
              notebook={selectedNotebook}
            />
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex">
          {Object.entries(views).map(([key, view]) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all duration-200 ${
                activeView === key
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div className={`transition-transform duration-200 ${
                activeView === key ? 'scale-110' : 'scale-100'
              }`}>
                {view.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{view.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
