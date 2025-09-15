'use client';

import { useState, useEffect } from 'react';
import BriefingViewer from './BriefingViewer';

export default function ToolsPanel({ notebook }) {
  const [activeTab, setActiveTab] = useState('briefing');
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
      const [briefingsRes] = await Promise.all([
        fetch(`/api/briefing?notebookId=${notebook.id}`),
      ]);

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
        console.log(`🔧 ${type} data structure:`, {
          id: data.id,
          title: data.title,
          hasContent: !!data.content,
          contentKeys: data.content ? Object.keys(data.content) : 'no content',
          contentType: typeof data.content
        });
        
        if (type === 'briefing') {
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
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Study Tools
          </h2>
          <p className="text-muted-foreground">
            Select a notebook to access study tools
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'briefing', label: 'Briefing', count: briefings.length },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
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
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
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
