'use client';

import { useState } from 'react';

export default function BriefingViewer({ briefings, onGenerate, loading }) {
  const [selectedBriefing, setSelectedBriefing] = useState(null);

  const handleBriefingSelect = (briefing) => {
    setSelectedBriefing(briefing);
  };

  if (briefings.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-secondary-700 mb-2">
            No Briefings Yet
          </h3>
          <p className="text-secondary-500 mb-4">
            Generate briefings from your sources to get comprehensive summaries.
          </p>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Generating...' : 'Generate Briefing'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Briefing Selector */}
      {briefings.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Briefing
          </label>
          <select
            value={selectedBriefing?.id || ''}
            onChange={(e) => {
              const briefing = briefings.find(b => b.id === e.target.value);
              handleBriefingSelect(briefing);
            }}
            className="input-field"
          >
            <option value="">Select a briefing...</option>
            {briefings.map((briefing) => (
              <option key={briefing.id} value={briefing.id}>
                {briefing.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Generate New Briefing Button */}
      <div className="mb-4">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Generating...' : 'Generate New Briefing'}
        </button>
      </div>

      {/* Briefing Content */}
      {selectedBriefing && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {selectedBriefing.title}
            </h3>
            <div className="text-sm text-secondary-500">
              Created: {new Date(selectedBriefing.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div className="text-secondary-800 leading-relaxed whitespace-pre-wrap">
              {selectedBriefing.content}
            </div>
          </div>
        </div>
      )}

      {/* Auto-select first briefing if only one exists */}
      {briefings.length === 1 && !selectedBriefing && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {briefings[0].title}
            </h3>
            <div className="text-sm text-secondary-500">
              Created: {new Date(briefings[0].createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div className="text-secondary-800 leading-relaxed whitespace-pre-wrap">
              {briefings[0].content}
            </div>
          </div>
        </div>
      )}

      {/* Briefing List (if multiple) */}
      {briefings.length > 1 && !selectedBriefing && (
        <div className="space-y-3">
          {briefings.map((briefing) => (
            <div
              key={briefing.id}
              onClick={() => handleBriefingSelect(briefing)}
              className="bg-white rounded-lg border border-secondary-200 p-4 cursor-pointer hover:bg-secondary-50 transition-colors"
            >
              <h4 className="font-medium text-secondary-900 mb-1">
                {briefing.title}
              </h4>
              <p className="text-sm text-secondary-500">
                Created: {new Date(briefing.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
