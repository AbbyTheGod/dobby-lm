'use client';

import { useEffect, useRef } from 'react';

export default function CitationTooltip({ citation, position, onClose }) {
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={tooltipRef}
      className="citation-tooltip animate-in fade-in-0 zoom-in-95"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-popover-foreground">
          {citation.source?.title || 'Source'}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="text-sm leading-relaxed text-popover-foreground mb-3">
        {citation.content}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Chunk {citation.chunk_index}</span>
        <span className="bg-muted px-2 py-1 rounded-full">
          {citation.source?.type?.toUpperCase() || 'TEXT'}
        </span>
      </div>
    </div>
  );
}
