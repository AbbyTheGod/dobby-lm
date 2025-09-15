'use client';

import { useState } from 'react';
import AddSourceModal from './AddSourceModal';
// import ScrapingStatus from './ScrapingStatus'; // Removed due to undici compatibility issues
import ThemeToggle from './ThemeToggle';

export default function NotebookSidebar({ 
  notebooks, 
  selectedNotebook, 
  onSelectNotebook, 
  onCreateNotebook,
  sources,
  onSourceAdded,
  onSourceDeleted,
  showAddSource,
  setShowAddSource
}) {

  return (
    <div className="flex flex-col h-full">
      {/* Header - Actual Google NotebookLM Style */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-medium text-gray-900 dark:text-white">
              DobbyLM
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={onCreateNotebook}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create notebook
        </button>
      </div>

      {/* Notebooks List - Actual Google NotebookLM Style */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Notebooks</h2>
            <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {Array.isArray(notebooks) ? notebooks.length : 0}
            </span>
          </div>
          <div className="space-y-1">
            {Array.isArray(notebooks) && notebooks.map((notebook) => (
              <div
                key={notebook.id}
                onClick={() => onSelectNotebook(notebook)}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                  selectedNotebook?.id === notebook.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {notebook.title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notebook.source_count || 0} sources
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(notebook.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {notebook.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {notebook.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {notebooks.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">No notebooks yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first notebook to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Sources Section */}
        {selectedNotebook && (
          <div className="border-t border-border/50 p-6 bg-muted/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Sources</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {sources.length}
                </span>
              </div>
              <button
                onClick={() => setShowAddSource(true)}
                className="btn-ghost text-sm hover:bg-primary/10 hover:text-primary"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Source
              </button>
            </div>
            
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div
                  key={source.id}
                  className="group p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-all duration-200"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {source.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {source.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(source.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-indicator ${
                        source.status === 'completed' 
                          ? 'status-success'
                          : source.status === 'processing'
                          ? 'status-warning'
                          : source.status === 'failed'
                          ? 'status-error'
                          : source.status === 'unsupported'
                          ? 'status-error'
                          : 'status-pending'
                      }`}>
                        {source.status === 'unsupported' ? 'not supported' : 
                         source.status === 'failed' ? 'failed' : 
                         source.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🗑️ NotebookSidebar: Delete button clicked for source:', source.id);
                          console.log('🗑️ NotebookSidebar: Source object:', source);
                          console.log('🗑️ NotebookSidebar: Source ID type:', typeof source.id);
                          console.log('🗑️ NotebookSidebar: Source ID value:', JSON.stringify(source.id));
                          onSourceDeleted(source.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete source"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {sources.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">No sources added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add PDFs, text, or URLs to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scraping Status */}
      {/* <ScrapingStatus /> Removed due to undici compatibility issues */}

      {/* Add Source Modal */}
      {showAddSource && (
        <AddSourceModal
          notebookId={selectedNotebook?.id}
          onClose={() => setShowAddSource(false)}
          onSuccess={() => {
            setShowAddSource(false);
            onSourceAdded();
          }}
        />
      )}
    </div>
  );
}
