'use client';

import { useState } from 'react';

export default function FlashcardViewer({ flashcards, onGenerate, loading }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  const currentSet = selectedSet || flashcards[0];
  const currentCard = currentSet?.content?.[currentCardIndex];

  const handleNext = () => {
    if (currentSet && currentCardIndex < currentSet.content.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleSetSelect = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-secondary-700 mb-2">
            No Flashcards Yet
          </h3>
          <p className="text-secondary-500 mb-4">
            Generate flashcards from your sources to start studying.
          </p>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Set Selector */}
      {flashcards.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Flashcard Set
          </label>
          <select
            value={currentSet?.id || ''}
            onChange={(e) => {
              const set = flashcards.find(s => s.id === e.target.value);
              handleSetSelect(set);
            }}
            className="input-field"
          >
            {flashcards.map((set) => (
              <option key={set.id} value={set.id}>
                {set.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Generate New Set Button */}
      <div className="mb-4">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Generating...' : 'Generate New Set'}
        </button>
      </div>

      {/* Flashcard */}
      {currentCard && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6 min-h-64 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                {currentCard.front}
              </h3>
              
              {showAnswer && (
                <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                  <p className="text-secondary-800">
                    {currentCard.back}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="text-sm text-secondary-500">
              {currentCardIndex + 1} of {currentSet.content.length}
            </div>
            
            <button
              onClick={showAnswer ? handleNext : () => setShowAnswer(true)}
              className="btn-primary"
            >
              {showAnswer ? 'Next' : 'Show Answer'}
            </button>
          </div>
        </div>
      )}

      {/* Set Info */}
      {currentSet && (
        <div className="mt-4 text-sm text-secondary-600">
          <p><strong>Set:</strong> {currentSet.title}</p>
          <p><strong>Created:</strong> {new Date(currentSet.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
