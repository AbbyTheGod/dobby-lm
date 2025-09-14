'use client';

import { useState } from 'react';
import CitationTooltip from './CitationTooltip';

export default function MessageBubble({ message, sources }) {
  const [hoveredCitation, setHoveredCitation] = useState(null);
  const [citationPosition, setCitationPosition] = useState({ x: 0, y: 0 });

  const isUser = message.role === 'user';

  const handleCitationHover = (citation, event) => {
    const rect = event.target.getBoundingClientRect();
    setCitationPosition({
      x: rect.left,
      y: rect.top - 10,
    });
    setHoveredCitation(citation);
  };

  const handleCitationLeave = () => {
    setHoveredCitation(null);
  };

  const renderContentWithCitations = (content) => {
    if (!message.citations || message.citations.length === 0) {
      return content;
    }

    // Replace citation markers with interactive elements
    const citationRegex = /\[S([A-Fa-f0-9]+):(\d+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // Find the citation data
      const sourceId = match[1];
      const chunkIndex = parseInt(match[2]);
      const citation = message.citations.find(
        c => c.source_id === sourceId && c.chunk_index === chunkIndex
      );

      if (citation) {
        const source = sources.find(s => s.id.startsWith(sourceId));
        parts.push(
          <span
            key={`${match.index}-${sourceId}-${chunkIndex}`}
            className="citation"
            onMouseEnter={(e) => handleCitationHover({ ...citation, source }, e)}
            onMouseLeave={handleCitationLeave}
          >
            {match[0]}
          </span>
        );
      } else {
        parts.push(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl ${
          isUser
            ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg'
            : 'card shadow-md'
        } rounded-xl p-4 transition-all duration-200 hover:shadow-lg`}
      >
        <div className="flex items-start space-x-3">
          {!isUser && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="prose prose-sm max-w-none">
              {isUser ? (
                <p className="mb-0 text-primary-foreground leading-relaxed">{message.content}</p>
              ) : (
                <div className="text-foreground leading-relaxed">
                  {renderContentWithCitations(message.content)}
                </div>
              )}
            </div>
            
            <div className={`flex items-center justify-between mt-3 ${
              isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}>
              <span className="text-xs">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {!isUser && message.citations && message.citations.length > 0 && (
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {message.citations.length} citation{message.citations.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citation Tooltip */}
      {hoveredCitation && (
        <CitationTooltip
          citation={hoveredCitation}
          position={citationPosition}
          onClose={() => setHoveredCitation(null)}
        />
      )}
    </div>
  );
}
