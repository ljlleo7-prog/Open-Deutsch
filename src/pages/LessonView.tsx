import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Lesson, Block, UserBlockProgress } from '../types';
import { lessonGuides, LocalizedText } from '../data/lessonGuides';
import { BookOpen, CheckCircle, PlayCircle, HelpCircle } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export const LessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t, language } = useI18n();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [progress, setProgress] = useState<UserBlockProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guide' | 'practice'>('guide');

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
          title: t('lesson.placeholder_title'),
          level: 'A1',
          stage_id: '1',
          type: 'grammar',
          description: t('lesson.placeholder_description'),
          order_index: 1,
          concept: 'basic_grammar',
          required_xp: 0
        };
        
        // Try to fetch real lesson if API supports it
        try {
            const realLesson = await api.getLesson(lessonId);
            if (realLesson) {
                setLesson(realLesson);
            } else {
                setLesson(lessonData);
            }
        } catch {
            console.warn("Using mock lesson data");
            setLesson(lessonData);
        }

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
  }, [lessonId, t]);

  if (loading) return <div className="p-8 text-center">{t('lesson.loading')}</div>;
  if (!lesson) return <div className="p-8 text-center text-red-500">{t('lesson.not_found')}</div>;

  const guide = lessonGuides[lesson.concept] || null;
  const resolveText = (value: LocalizedText) => value[language] ?? value.en;

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
  
  const totalBlocks = blocks.length;
  const completedBlocks = blocks.filter(b => {
      const status = getBlockStatus(b.id);
      return status === 'passed' || status === 'mastered';
  }).length;
  const progressPercentage = Math.round((completedBlocks / totalBlocks) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/course" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; {t('lesson.back_to_course')}
      </Link>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
                    <p className="text-gray-600 max-w-2xl">{lesson.description}</p>
                    <div className="mt-4 flex gap-2">
                        <span className="px-3 py-1 bg-white text-gray-600 rounded-full text-sm font-medium border border-gray-200 shadow-sm">
                          {t('lesson.level_label', { level: lesson.level })}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium capitalize border border-blue-200 shadow-sm">
                          {lesson.type}
                        </span>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-sm text-gray-500 mb-1">{t('lesson.progress_label')}</div>
                    <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('guide')}
                className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'guide' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <BookOpen size={20} />
                {t('lesson.tab_guide')}
            </button>
            <button 
                onClick={() => setActiveTab('practice')}
                className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'practice' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <CheckCircle size={20} />
                {t('lesson.tab_practice')}
            </button>
        </div>

        <div className="p-8 min-h-[400px]">
            {activeTab === 'guide' ? (
                <div className="prose max-w-none">
                    {guide ? (
                        <div className="space-y-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">{resolveText(guide.title)}</h2>
                                <p className="text-lg text-gray-600 mt-2">{resolveText(guide.description)}</p>
                            </div>
                            
                            {guide.sections.map((section, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{resolveText(section.title)}</h3>
                                    <p className="text-gray-700 mb-4 leading-relaxed">{resolveText(section.content)}</p>
                                    
                                    {section.example && section.example.length > 0 && (
                                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('lesson.examples_label')}</div>
                                            <div className="divide-y divide-gray-100">
                                                {section.example.map((ex, exIdx) => (
                                                    <div key={exIdx} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <span className="font-medium text-gray-900">{ex.de}</span>
                                                        <span className="text-gray-500 italic text-sm">{resolveText(ex.translations)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="pt-6 flex justify-center">
                                <button 
                                    onClick={() => setActiveTab('practice')}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <PlayCircle size={20} />
                                    {t('lesson.start_practice')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                <HelpCircle size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('lesson.no_guide_title')}</h3>
                            <p className="text-gray-500 mb-8">{t('lesson.no_guide_body')}</p>
                            <button 
                                onClick={() => setActiveTab('practice')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                {t('lesson.go_to_practice')}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">{t('lesson.practice_blocks')}</h2>
                        <span className="text-sm text-gray-500">{t('lesson.blocks_completed', { completed: completedBlocks, total: totalBlocks })}</span>
                    </div>
                    
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
                                            <p className="text-xs text-gray-500">{t('lesson.concept_label', { concept: block.concept.replace(/_/g, ' ') })}</p>
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
                                                {status === 'locked' || status === 'available' ? t('lesson.block_start') : t('lesson.block_retake')}
                                            </Link>
                                        ) : (
                                            <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed">
                                                {t('lesson.block_locked')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
