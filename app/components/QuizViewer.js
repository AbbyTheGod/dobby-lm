'use client';

import { useState } from 'react';

export default function QuizViewer({ quizzes, onGenerate, loading }) {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = selectedQuiz?.content?.questions?.[currentQuestionIndex];

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < selectedQuiz.content.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  if (quizzes.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-secondary-700 mb-2">
            No Quizzes Yet
          </h3>
          <p className="text-secondary-500 mb-4">
            Generate quizzes from your sources to test your knowledge.
          </p>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Quiz Selector */}
      {quizzes.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Quiz
          </label>
          <select
            value={selectedQuiz?.id || ''}
            onChange={(e) => {
              const quiz = quizzes.find(q => q.id === e.target.value);
              handleQuizSelect(quiz);
            }}
            className="input-field"
          >
            <option value="">Select a quiz...</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Generate New Quiz Button */}
      <div className="mb-4">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Generating...' : 'Generate New Quiz'}
        </button>
      </div>

      {/* Quiz Content */}
      {selectedQuiz && !showResults && currentQuestion && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="mb-4">
            <div className="text-sm text-secondary-500 mb-2">
              Question {currentQuestionIndex + 1} of {selectedQuiz.content.questions.length}
            </div>
            <h3 className="text-lg font-medium text-secondary-900">
              {currentQuestion.question}
            </h3>
          </div>

          {currentQuestion.type === 'multiple_choice' ? (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={answers[currentQuestionIndex] === option}
                    onChange={() => handleAnswerSelect(currentQuestionIndex, option)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                value={answers[currentQuestionIndex] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                className="input-field"
                rows={4}
                placeholder="Enter your answer..."
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              {currentQuestionIndex === selectedQuiz.content.questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Quiz Results
          </h3>
          
          <div className="space-y-4">
            {selectedQuiz.content.questions.map((question, index) => (
              <div key={index} className="border-b border-secondary-200 pb-4">
                <h4 className="font-medium text-secondary-900 mb-2">
                  Question {index + 1}: {question.question}
                </h4>
                <div className="text-sm">
                  <p className="text-secondary-600 mb-1">
                    <strong>Your answer:</strong> {answers[index] || 'No answer provided'}
                  </p>
                  <p className="text-secondary-600">
                    <strong>Correct answer:</strong> {question.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button
              onClick={resetQuiz}
              className="btn-primary w-full"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Info */}
      {selectedQuiz && (
        <div className="mt-4 text-sm text-secondary-600">
          <p><strong>Quiz:</strong> {selectedQuiz.title}</p>
          <p><strong>Questions:</strong> {selectedQuiz.content.questions.length}</p>
          <p><strong>Created:</strong> {new Date(selectedQuiz.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
