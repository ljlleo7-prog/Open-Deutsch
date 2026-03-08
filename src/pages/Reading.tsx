import React, { useEffect, useMemo, useState } from 'react';
import { fetchReadingsFromSupabase, GeneratedText } from '../lib/generator';
import { Topic } from '../types';
import { BookOpen, RefreshCw, Check, X, Car, Plane, History, Newspaper, Train, Cpu } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../hooks/useI18n';
import { awardXpWithHourlyCap } from '../lib/db';
import { supabase } from '../lib/supabase';

type PrimarySource = {
  title: string;
  url: string;
  excerpt: string;
  content: string;
  source: string;
};

type ReadingContent = GeneratedText & {
  sources?: PrimarySource[];
};

export default function Reading() {
  const [currentText, setCurrentText] = useState<ReadingContent | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState<boolean[]>([]);
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useI18n();
  const readingXpPerCorrect = 1;
  const readingHourlyCap = 5;

  const topics = useMemo(() => {
    const baseTopics: { id: Topic; label: string; icon: React.ElementType }[] = [
      { id: 'history', label: t('topics.history'), icon: History },
      { id: 'f1', label: t('topics.f1'), icon: Car },
      { id: 'aviation', label: t('topics.aviation'), icon: Plane },
      { id: 'news', label: t('topics.news'), icon: Newspaper },
      { id: 'transportation', label: t('topics.transportation') || 'Transport', icon: Train },
      { id: 'tech', label: t('topics.tech') || 'Technology', icon: Cpu },
    ];
    const extras = customTopics.map(topic => ({
      id: topic,
      label: topic,
      icon: BookOpen
    }));
    const baseIds = new Set(baseTopics.map(topic => topic.id));
    const filteredExtras = extras.filter(topic => !baseIds.has(topic.id));
    return [...baseTopics, ...filteredExtras];
  }, [customTopics, t]);

  useEffect(() => {
    let active = true;
    const loadInterests = async () => {
      const stored = localStorage.getItem('opendeutsch_guest_interests');
      const storedTopics = stored ? (JSON.parse(stored) as string[]) : [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (user) {
        const { data } = await supabase
          .from('opendeutsch_user_interests')
          .select('topic')
          .eq('user_id', user.id);
        const topicsFromDb = (data ?? []).map(item => item.topic as string);
        setCustomTopics(Array.from(new Set([...topicsFromDb, ...storedTopics])));
      } else {
        setCustomTopics(Array.from(new Set(storedTopics)));
      }
    };
    loadInterests();
    return () => {
      active = false;
    };
  }, []);

  const buildTopicQuery = (topic: Topic) => {
    const queryMap: Record<string, string> = {
      history: 'Deutsche Geschichte',
      f1: 'Formel 1 Weltmeisterschaft',
      aviation: 'Luftfahrt',
      news: `Aktuelle Nachrichten ${new Date().getFullYear()}`,
      transportation: 'Verkehr und Logistik Deutschland',
      tech: 'Technologie und Innovation'
    };
    return queryMap[String(topic)] ?? String(topic);
  };


  const handleGenerate = async (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedAnswers([]);
    setShowFeedback([]);
    setErrorMessage(null);
    setIsLoading(true);
    setSearchQuery(buildTopicQuery(topic));
    try {
      // 1. Try Supabase first (Pre-generated content)
      const dbReadings = await fetchReadingsFromSupabase(topic, 10, undefined, selectedLevel);
      
      if (dbReadings && dbReadings.length > 0) {
        // If switching topics or first load, pick the newest (first) reading
        // Otherwise, pick a random one to rotate (excluding current if possible)
        let reading;
        if (!currentText || currentText.topic !== topic) {
          reading = dbReadings[0];
        } else {
          // Filter out current reading to avoid repeat
          const others = dbReadings.filter(r => r.id !== currentText.id);
          if (others.length > 0) {
            reading = others[Math.floor(Math.random() * others.length)];
          } else {
            reading = dbReadings[0]; // Fallback if only 1 exists
          }
        }
        
        setCurrentText(reading);
        setSelectedAnswers(Array(reading.questions.length).fill(null));
        setShowFeedback(Array(reading.questions.length).fill(false));
        setIsLoading(false);
        return;
      }

      // If no DB readings found, show error instead of falling back
      throw new Error('No readings found in database');

    } catch (e) {
      console.error(e);
      setCurrentText(null);
      setErrorMessage(t('reading.no_sources_db') || "Keine Artikel in der Datenbank gefunden. Bitte führen Sie das Update-Skript aus.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSelectedTopic(null);
    setSelectedAnswers([]);
    setShowFeedback([]);
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const dbReadings = await fetchReadingsFromSupabase(null, 10, query, selectedLevel);
      if (dbReadings && dbReadings.length > 0) {
        const reading = dbReadings[0];
        setCurrentText(reading);
        setSelectedAnswers(Array(reading.questions.length).fill(null));
        setShowFeedback(Array(reading.questions.length).fill(false));
      } else {
        throw new Error('No readings found');
      }
    } catch (e) {
      console.error(e);
      setCurrentText(null);
      setErrorMessage(t('reading.no_sources_db') || "Keine Artikel in der Datenbank gefunden.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (questionIndex: number, answerIndex: number) => {
    if (!currentText?.questions?.length) return;
    if (showFeedback[questionIndex]) return;
    setSelectedAnswers(prev => {
      const updated = [...prev];
      updated[questionIndex] = answerIndex;
      return updated;
    });
    setShowFeedback(prev => {
      const updated = [...prev];
      updated[questionIndex] = true;
      return updated;
    });
    const isCorrect = answerIndex === currentText.questions[questionIndex].correctIndex;
    if (isCorrect && currentText) {
      await awardXpWithHourlyCap({
        source: 'reading_mcq',
        basePoints: readingXpPerCorrect,
        capPerHour: readingHourlyCap,
        metadata: {
          topic: currentText.topic,
          text_id: currentText.id
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <BookOpen className="text-german-gold" /> {t('reading.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {t('reading.topics_title')}
          </h2>
          {topics.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => handleGenerate(t.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                  selectedTopic === t.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full sm:w-32">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Level
                </label>
                <select
                  value={selectedLevel || ''}
                  onChange={(e) => setSelectedLevel(e.target.value || undefined)}
                  className="w-full px-3 py-3 rounded-lg border border-border bg-white dark:bg-card text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="">All</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  {t('reading.search_label')}
                </label>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder={t('reading.search_placeholder')}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                {t('reading.search_button')}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 text-muted-foreground">
              {t('reading.loading')}
            </div>
          ) : currentText ? (
            (() => {
              const topicLabel = topics.find(t => t.id === currentText.topic)?.label || currentText.topic;
              return (
            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-muted-foreground uppercase">
                      {topicLabel}
                    </span>
                    {currentText.level && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase">
                        {currentText.level}
                      </span>
                    )}
                    {currentText.complexity_score && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 uppercase">
                        Score: {currentText.complexity_score}
                      </span>
                    )}
                    {currentText.published_at && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-muted-foreground uppercase">
                        {new Date(currentText.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentText.title}
                  </h2>
                </div>
                <button 
                  onClick={() => handleGenerate(currentText.topic)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                  title={t('reading.generate_new')}
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-10">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {currentText.content}
                </p>
              </div>

              {currentText.source && (
                <div className="border-t border-border pt-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">{t('reading.sources_title')}</h3>
                  <div className="rounded-lg border border-border p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="text-xs uppercase text-muted-foreground mb-2">{currentText.source.name}</div>
                    <a
                      href={currentText.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-semibold text-primary hover:underline"
                    >
                      {t('reading.original_article')}
                    </a>
                  </div>
                </div>
              )}

              {currentText.vocabulary && currentText.vocabulary.length > 0 && (
                <div className="border-t border-border pt-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">{t('vocabulary.title')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentText.vocabulary.map((vocab, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-border">
                        <div className="font-bold text-gray-900 dark:text-white flex justify-between">
                          <span>{vocab.word}</span>
                          <span className="text-xs text-muted-foreground font-normal bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">{vocab.pos}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vocab.translation}</div>
                        {vocab.definition && (
                          <div className="text-xs text-muted-foreground mt-1 italic">{vocab.definition}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentText.sources && currentText.sources.length > 0 && (
                <div className="border-t border-border pt-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">{t('reading.sources_title')}</h3>
                  <div className="space-y-4">
                    {currentText.sources.map((source) => (
                      <div key={`${source.source}-${source.title}`} className="rounded-lg border border-border p-4 bg-gray-50 dark:bg-gray-900">
                        <div className="text-xs uppercase text-muted-foreground mb-2">{source.source}</div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base font-semibold text-primary hover:underline"
                        >
                          {source.title}
                        </a>
                        <p className="text-sm text-muted-foreground mt-2">
                          {source.excerpt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-8">
                <h3 className="text-lg font-semibold mb-4">{t('reading.comprehension_check')}</h3>
                <div className="space-y-6">
                  {currentText.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                      <p className="font-medium mb-4">{question.question}</p>
                      <div className="space-y-3">
                        {question.options.map((option, idx) => {
                          let btnClass = "w-full text-left px-4 py-3 rounded-lg border transition-all ";
                          if (showFeedback[questionIndex]) {
                            if (idx === question.correctIndex) {
                              btnClass += "bg-green-100 border-green-500 text-green-800";
                            } else if (idx === selectedAnswers[questionIndex]) {
                              btnClass += "bg-red-100 border-red-500 text-red-800";
                            } else {
                              btnClass += "bg-white dark:bg-card border-border opacity-50";
                            }
                          } else {
                            btnClass += "bg-white dark:bg-card border-border hover:border-primary hover:bg-primary/5";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswer(questionIndex, idx)}
                              disabled={showFeedback[questionIndex]}
                              className={btnClass}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showFeedback[questionIndex] && idx === question.correctIndex && (
                                  <Check size={18} className="text-green-600" />
                                )}
                                {showFeedback[questionIndex] && idx === selectedAnswers[questionIndex] && idx !== question.correctIndex && (
                                  <X size={18} className="text-red-600" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
              );
            })()
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <BookOpen size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('reading.select_title')}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {errorMessage ?? t('reading.select_body')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
