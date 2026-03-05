import React, { useState } from 'react';
import { ExerciseItem } from '../lib/generator';

interface ExerciseRendererProps {
  exercise: ExerciseItem;
  onAnswer: (isCorrect: boolean) => void;
  showFeedback?: boolean;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ exercise, onAnswer, showFeedback }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    
    let isCorrect = false;
    if (exercise.type === 'multiple_choice' || exercise.type === 'vocabulary') {
      isCorrect = selectedOption === exercise.answer;
    } else if (exercise.type === 'fill_blank' || exercise.type === 'grammar_cloze' || exercise.type === 'tense') {
      isCorrect = textInput.trim().toLowerCase() === exercise.answer.toLowerCase();
    } else if (exercise.type === 'sentence_reconstruction' || exercise.type === 'word_order' || exercise.type === 'sentence_writing') {
      // Normalize spaces and punctuation for comparison
      const normalize = (s: string) => s.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").trim().toLowerCase();
      isCorrect = normalize(textInput) === normalize(exercise.answer);
    }

    onAnswer(isCorrect);
  };

  const getFeedbackColor = () => {
    if (!showFeedback && !submitted) return 'gray';
    if (submitted) {
        // We can check correctness again or pass it down, 
        // but simple re-eval is fine for UI state
        let isCorrect = false;
        if (exercise.type === 'multiple_choice' || exercise.type === 'vocabulary') {
            isCorrect = selectedOption === exercise.answer;
        } else if (exercise.type === 'fill_blank' || exercise.type === 'grammar_cloze' || exercise.type === 'tense') {
            isCorrect = textInput.trim().toLowerCase() === exercise.answer.toLowerCase();
        } else {
             const normalize = (s: string) => s.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").trim().toLowerCase();
             isCorrect = normalize(textInput) === normalize(exercise.answer);
        }
        return isCorrect ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-900';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {exercise.type.replace('_', ' ').toUpperCase()}
        </h3>
        <p className="text-xl text-gray-900">{exercise.prompt}</p>
        {exercise.promptSecondary && (
            <p className="text-md text-gray-500 mt-2">{exercise.promptSecondary}</p>
        )}
      </div>

      <div className="mb-6">
        {(exercise.type === 'multiple_choice' || exercise.type === 'vocabulary' || exercise.type === 'tense') && exercise.options && (
          <div className="grid grid-cols-1 gap-3">
            {exercise.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !submitted && setSelectedOption(option)}
                className={`p-3 text-left rounded-md border transition-colors ${
                  selectedOption === option
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } ${submitted && option === exercise.answer ? 'bg-green-100 border-green-500' : ''}
                  ${submitted && selectedOption === option && option !== exercise.answer ? 'bg-red-100 border-red-500' : ''}
                `}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {(exercise.type === 'fill_blank' || exercise.type === 'grammar_cloze' || exercise.type === 'sentence_reconstruction' || exercise.type === 'word_order' || exercise.type === 'sentence_writing') && (
          <div>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your answer here..."
              disabled={submitted}
            />
            {submitted && (
                <div className="mt-2 text-sm">
                    <span className="font-bold">Correct Answer:</span> {exercise.answer}
                </div>
            )}
          </div>
        )}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={(!selectedOption && !textInput)}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Check Answer
        </button>
      )}
      
      {submitted && (
          <div className={`text-lg font-bold ${getFeedbackColor()}`}>
              {getFeedbackColor().includes('green') ? 'Correct!' : 'Incorrect'}
          </div>
      )}
    </div>
  );
};
