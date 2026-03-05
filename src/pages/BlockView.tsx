import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateBlock, ExerciseItem, Level } from '../lib/generator';
import { api } from '../lib/api';
import { ExerciseRenderer } from '../components/ExerciseRenderer';

export const BlockView: React.FC = () => {
  const { lessonId, blockId } = useParams<{ lessonId: string; blockId: string }>();
  const navigate = useNavigate();
  
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0); // Count of correct answers
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [status, setStatus] = useState<'passed' | 'failed' | 'mastered' | null>(null);

  useEffect(() => {
    // In a real app, fetch block definition from API/DB
    // For now, generate random block based on ID or simple logic
    // We assume blockId encodes some info or we just use random for demo
    
    // Fetch lesson to get level
    // This part is mocked for now as we don't have the full DB populated yet
    const level: Level = 'A1'; 
    const concept = 'vocabulary'; // Default concept

    const generated = generateBlock(concept, level);
    setExercises(generated);
    setLoading(false);
  }, [blockId]);

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    if (isCorrect) {
      setScore(s => s + 1);
    }

    if (currentIndex < exercises.length - 1) {
      setTimeout(() => {
        setCurrentIndex(c => c + 1);
      }, 1500); // Delay for feedback
    } else {
      finishBlock(newAnswers);
    }
  };

  const finishBlock = async (finalAnswers: boolean[]) => {
    const correctCount = finalAnswers.filter(a => a).length;
    const percentage = (correctCount / exercises.length) * 100;
    
    let earnedXp = 0;
    let newStatus: 'passed' | 'failed' | 'mastered' = 'failed';

    if (percentage >= 100) {
      earnedXp = 10;
      newStatus = 'mastered';
    } else if (percentage >= 80) {
      earnedXp = 8;
      newStatus = 'mastered';
    } else if (percentage >= 60) {
      earnedXp = 5;
      newStatus = 'passed';
    } else {
      earnedXp = 0;
      newStatus = 'failed';
    }

    setXpEarned(earnedXp);
    setStatus(newStatus);
    setCompleted(true);

    // Save progress
    if (blockId) {
        try {
            await api.saveBlockProgress(blockId, percentage, newStatus !== 'failed', newStatus === 'mastered', earnedXp);
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading exercises...</div>;

  if (completed) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">
          {status === 'failed' ? 'Block Failed' : 'Block Completed!'}
        </h2>
        <div className="text-4xl mb-4">
          {status === 'failed' ? '❌' : status === 'mastered' ? '🏆' : '✅'}
        </div>
        <p className="text-lg mb-2">Score: {Math.round((score / exercises.length) * 100)}%</p>
        <p className="text-lg mb-6">XP Earned: +{xpEarned} XP</p>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate(`/lesson/${lessonId}`)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Back to Lesson
          </button>
          {status === 'failed' && (
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center max-w-2xl mx-auto">
        <span className="text-gray-500">Question {currentIndex + 1} of {exercises.length}</span>
        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <ExerciseRenderer 
        exercise={exercises[currentIndex]} 
        onAnswer={handleAnswer}
        showFeedback={true}
      />
    </div>
  );
};
