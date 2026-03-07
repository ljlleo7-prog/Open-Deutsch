import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Level as CourseLevel, Stage, Lesson, Topic, UserXP } from '../types';
import { generateVocabularyCards, Level as ExerciseLevel, VocabularyCard } from '../lib/generator';
import { topicPools } from '../data/wordPools';
import { useI18n } from '../hooks/useI18n';

export const CourseMap: React.FC = () => {
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [stages, setStages] = useState<Stage[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [userXP, setUserXP] = useState<UserXP[]>([]);
  const [loading, setLoading] = useState(true);
  const [vocabTopic, setVocabTopic] = useState<Topic>(() => Object.keys(topicPools)[0] || 'history');
  const [vocabCards, setVocabCards] = useState<VocabularyCard[]>([]);
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabRevealed, setVocabRevealed] = useState(false);
  const [vocabKnown, setVocabKnown] = useState(0);
  const [vocabReview, setVocabReview] = useState(0);
  const [vocabLoading, setVocabLoading] = useState(false);
  const { t } = useI18n();

  const buildFallbackLessons = (stage: Stage, levelId: string): Lesson[] => {
    const types: Lesson['type'][] = ['grammar', 'sentence', 'word-order'];
    return Array.from({ length: 3 }, (_, index) => ({
      id: `${stage.id}-lesson-${index + 1}`,
      title: `${stage.title} ${index + 1}`,
      level: levelId,
      stage_id: stage.id,
      type: types[index % types.length],
      description: stage.description,
      order_index: index + 1,
      concept: `${stage.title.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`,
      required_xp: 0
    }));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const levelsData = await api.getLevels();
        setLevels(levelsData);
        if (levelsData.length > 0) {
            setSelectedLevel(levelsData[0].id); // Default to first level
        }
        
        const xpData = await api.getUserXP();
        if (xpData) setUserXP(xpData);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchStagesAndLessons() {
      if (!selectedLevel) return;
      setLoading(true);
      try {
        const stagesData = await api.getStages(selectedLevel);
        setStages(stagesData);

        const lessonsMap: Record<string, Lesson[]> = {};
        for (const stage of stagesData) {
          const lessonsData = await api.getLessons(stage.id);
          const filteredLessons = lessonsData.filter(lesson => lesson.type !== 'vocabulary');
          lessonsMap[stage.id] = filteredLessons.length > 0 ? filteredLessons : buildFallbackLessons(stage, selectedLevel);
        }
        setLessons(lessonsMap);
      } catch (e) {
        console.error("Failed to fetch stages/lessons", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStagesAndLessons();
  }, [selectedLevel]);

  useEffect(() => {
    const loadVocabulary = async () => {
      if (!selectedLevel) return;
      setVocabLoading(true);
      try {
        const cards = await generateVocabularyCards(selectedLevel as ExerciseLevel, vocabTopic, 12);
        setVocabCards(cards);
        setVocabIndex(0);
        setVocabRevealed(false);
        setVocabKnown(0);
        setVocabReview(0);
      } finally {
        setVocabLoading(false);
      }
    };
    void loadVocabulary();
  }, [selectedLevel, vocabTopic]);

  const getTotalXP = () => userXP.reduce((sum, item) => sum + item.amount, 0);
  const currentLevelData = levels.find(l => l.id === selectedLevel);
  const totalXP = getTotalXP();
  const targetXP = currentLevelData?.total_xp_target || 1000;
  const progressPercent = Math.min(100, (totalXP / targetXP) * 100);
  const canAdvance = progressPercent >= 80;
  const topics = Object.keys(topicPools);
  const currentCard = vocabCards[vocabIndex];
  const sessionComplete = vocabCards.length > 0 && vocabIndex >= vocabCards.length;

  const topicLabel = (topic: string) => {
    const key = `topics.${topic}`;
    const translated = t(key);
    return translated === key ? topic.charAt(0).toUpperCase() + topic.slice(1) : translated;
  };

  const handleReveal = () => setVocabRevealed(true);
  const handleCardResult = (known: boolean) => {
    if (!currentCard) return;
    if (known) {
      setVocabKnown(count => count + 1);
    } else {
      setVocabReview(count => count + 1);
    }
    setVocabRevealed(false);
    setVocabIndex(index => index + 1);
  };

  const handleRestart = () => {
    setVocabIndex(0);
    setVocabRevealed(false);
    setVocabKnown(0);
    setVocabReview(0);
  };

  if (loading && levels.length === 0) return <div className="p-8 text-center">Loading course map...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">{t('course.title')}</h1>
      
      {/* Level Selector */}
      <div className="flex justify-center mb-8 gap-4 flex-wrap">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              selectedLevel === level.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {level.name}
          </button>
        ))}
      </div>

      {/* XP Progress for Level */}
      {currentLevelData && (
          <div className="max-w-4xl mx-auto mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-700">{t('course.level_progress')}</h3>
                  <span className="text-sm font-medium text-gray-500">{t('course.xp_progress', { current: totalXP, target: targetXP })}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                  ></div>
              </div>
              <div className="text-right">
                  {canAdvance ? (
                      <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-md transition-colors animate-pulse">
                          {t('course.advance_test')}
                      </button>
                  ) : (
                      <span className="text-sm text-gray-400 italic">
                          {t('course.advance_locked')}
                      </span>
                  )}
              </div>
          </div>
      )}

      {/* Stages List */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{stage.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{stage.description}</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons[stage.id]?.map((lesson) => (
                <Link 
                  to={`/lesson/${lesson.id}`} 
                  key={lesson.id}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase">
                      {lesson.type}
                    </span>
                    {/* Placeholder for status icon */}
                    <span className="text-gray-300 group-hover:text-blue-500">★</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{lesson.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{lesson.description}</p>
                </Link>
              ))}
              {(!lessons[stage.id] || lessons[stage.id].length === 0) && (
                <div className="col-span-full text-center py-8 text-gray-400 italic">
                  No lessons available in this stage yet.
                </div>
              )}
            </div>
          </div>
        ))}
        {stages.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">
                {t('course.no_stages')}
            </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('vocab.title')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('vocab.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">{t('vocab.topic_label')}</div>
              <select
                value={vocabTopic}
                onChange={(event) => setVocabTopic(event.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topicLabel(topic)}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-md border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-400"
            >
              {t('vocab.restart')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {vocabLoading && (
            <div className="text-center text-gray-500">{t('vocab.loading')}</div>
          )}
          {!vocabLoading && vocabCards.length === 0 && (
            <div className="text-center text-gray-500">{t('vocab.empty')}</div>
          )}
          {!vocabLoading && vocabCards.length > 0 && sessionComplete && (
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 mb-2">{t('vocab.complete_title')}</div>
              <div className="text-sm text-gray-500 mb-4">{t('vocab.complete_body', { known: vocabKnown, review: vocabReview })}</div>
              <button
                onClick={handleRestart}
                className="px-5 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                {t('vocab.restart')}
              </button>
            </div>
          )}
          {!vocabLoading && currentCard && !sessionComplete && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{t('vocab.progress', { current: vocabIndex + 1, total: vocabCards.length })}</span>
                <span>{t('vocab.level_label', { level: selectedLevel })}</span>
              </div>
              <div className="rounded-lg border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">{currentCard.word.de}</div>
                {vocabRevealed && (
                  <div className="text-sm text-gray-500 mb-4">{currentCard.word.en}</div>
                )}
                {!vocabRevealed ? (
                  <button
                    onClick={handleReveal}
                    className="px-5 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {t('vocab.show_meaning')}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold text-gray-700 mb-1">{t('vocab.example_label')}</div>
                      <div>{currentCard.example.de}</div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleCardResult(false)}
                        className="px-4 py-2 rounded-md border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-400"
                      >
                        {t('vocab.review')}
                      </button>
                      <button
                        onClick={() => handleCardResult(true)}
                        className="px-4 py-2 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700"
                      >
                        {t('vocab.known')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>{t('vocab.known_count', { count: vocabKnown })}</span>
                <span>{t('vocab.review_count', { count: vocabReview })}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
