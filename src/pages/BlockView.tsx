import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseItem } from '../lib/generator';
import { api } from '../lib/api';
import { awardXpWithHourlyCap } from '../lib/db';
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
    async function init() {
      if (!blockId || !lessonId) return;
      try {
        // Fetch block details
        const block = await api.getBlock(blockId);
        if (!block) {
          console.error('Block not found');
          // Fallback or error handling
          setLoading(false);
          return;
        }

        // Fetch lesson details (to get level)
        // If api.getLesson is not available or fails, fallback to A1 or try to infer
        let level = 'A1';
        let lessonConcept: string | undefined;
        try {
          const lesson = await api.getLesson(lessonId);
          if (lesson) {
            level = lesson.level;
            lessonConcept = lesson.concept;
          }
        } catch (e) {
          console.warn('Failed to fetch lesson, using default level', e);
        }

        // Generate content
        // Cast level to Level type if needed, or api.generateBlockContent handles it
        const generated = await api.generateBlockContent(block, level, lessonConcept);
        setExercises(generated);
      } catch (e) {
        console.error('Failed to initialize block', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [blockId, lessonId]);

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

    if (percentage >= 90) {
      earnedXp = 2;
      newStatus = 'mastered';
    } else if (percentage >= 60) {
      earnedXp = 1;
      newStatus = 'passed';
    } else {
      earnedXp = 0;
      newStatus = 'failed';
    }

    let awardedXp = earnedXp;
    if (earnedXp > 0) {
      const xpResult = await awardXpWithHourlyCap({
        source: 'lesson_exercise',
        basePoints: earnedXp,
        capPerHour: 5,
        metadata: {
          lesson_id: lessonId,
          block_id: blockId,
          score: percentage
        }
      });
      awardedXp = xpResult?.awardedPoints ?? 0;
    }

    setXpEarned(awardedXp);
    setStatus(newStatus);
    setCompleted(true);

    // Save progress
    if (blockId) {
        try {
            await api.saveBlockProgress(blockId, percentage, newStatus !== 'failed', newStatus === 'mastered', awardedXp);
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading exercises...</div>;
  if (exercises.length === 0) return <div className="p-8 text-center text-red-500">No exercises generated or block not found.</div>;

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
