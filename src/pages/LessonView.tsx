import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Lesson, Block, UserBlockProgress } from '../types';

export const LessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [progress, setProgress] = useState<UserBlockProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!lessonId) return;
      try {
        // fetch lesson details
        // In real app: const lessonData = await api.getLesson(lessonId);
        // Mock for now since we don't have getLesson by ID directly exposed or seeded perfectly
        // We'll just assume we can get it or mock it
        const lessonData: Lesson = {
            id: lessonId,
            title: 'Lesson Title Placeholder', // Ideally fetch this
            level: 'A1',
            stage_id: '1',
            type: 'grammar',
            description: 'Learn basic grammar concepts.',
            order_index: 1,
            concept: 'basic_grammar',
            required_xp: 0
        }; 
        setLesson(lessonData);

        // Fetch blocks
        let blocksData = await api.getBlocks(lessonId);
        if (blocksData.length === 0) {
            // Generate default blocks if none exist
            blocksData = [
                { id: `b1-${lessonId}`, lesson_id: lessonId, type: 'vocabulary', concept: 'vocabulary_basics', order_index: 1 },
                { id: `b2-${lessonId}`, lesson_id: lessonId, type: 'grammar_cloze', concept: 'grammar_cloze_simple', order_index: 2 },
                { id: `b3-${lessonId}`, lesson_id: lessonId, type: 'sentence_reconstruction', concept: 'sentence_structure', order_index: 3 },
                { id: `b4-${lessonId}`, lesson_id: lessonId, type: 'multiple_choice', concept: 'comprehension', order_index: 4 },
                { id: `b5-${lessonId}`, lesson_id: lessonId, type: 'sentence_writing', concept: 'writing_practice', order_index: 5 },
            ];
        }
        setBlocks(blocksData);

        // Fetch user progress
        const progressData = await api.getUserProgress();
        if (progressData) {
            setProgress(progressData);
        }
      } catch (e) {
        console.error("Failed to load lesson", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lessonId]);

  if (loading) return <div className="p-8 text-center">Loading lesson...</div>;
  if (!lesson) return <div className="p-8 text-center text-red-500">Lesson not found</div>;

  const getBlockStatus = (blockId: string) => {
    const p = progress.find(pr => pr.block_id === blockId);
    return p ? p.status : 'locked'; // Default to locked, logic to unlock needs to be implemented
  };

  const getBlockScore = (blockId: string) => {
      const p = progress.find(pr => pr.block_id === blockId);
      return p ? p.score : 0;
  };

  // Logic to determine if a block is available (unlocked)
  // For simplicity: unlock next if previous passed, or all unlocked for testing
  const isBlockUnlocked = (index: number) => {
      if (index === 0) return true;
      const prevBlockId = blocks[index - 1].id;
      const prevStatus = getBlockStatus(prevBlockId);
      return prevStatus === 'passed' || prevStatus === 'mastered';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/course" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Course</Link>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
            <p className="text-gray-600">{lesson.description}</p>
            <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">Level {lesson.level}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium capitalize">{lesson.type}</span>
            </div>
        </div>

        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Exercise Blocks</h2>
            <div className="space-y-4">
                {blocks.map((block, index) => {
                    const status = getBlockStatus(block.id);
                    const unlocked = isBlockUnlocked(index);
                    const score = getBlockScore(block.id);
                    
                    return (
                        <div key={block.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            unlocked 
                                ? 'bg-white border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md' 
                                : 'bg-gray-50 border-gray-100 opacity-60'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                    status === 'mastered' ? 'bg-yellow-100 text-yellow-600' :
                                    status === 'passed' ? 'bg-green-100 text-green-600' :
                                    status === 'failed' ? 'bg-red-100 text-red-600' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 capitalize">{block.type.replace('_', ' ')}</h3>
                                    <p className="text-xs text-gray-500">Concept: {block.concept.replace(/_/g, ' ')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {status !== 'locked' && status !== 'available' && (
                                    <span className={`text-sm font-bold ${
                                        score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                        {Math.round(score)}%
                                    </span>
                                )}
                                
                                {unlocked ? (
                                    <Link 
                                        to={`/lesson/${lessonId}/block/${block.id}`}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                                    >
                                        {status === 'locked' || status === 'available' ? 'Start' : 'Retake'}
                                    </Link>
                                ) : (
                                    <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed">
                                        Locked
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
