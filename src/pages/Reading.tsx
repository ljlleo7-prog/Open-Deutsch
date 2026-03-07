import React, { useEffect, useMemo, useState } from 'react';
import { generateContextReadingText, fetchReadingsFromSupabase, GeneratedText } from '../lib/generator';
import { Topic } from '../types';
import { BookOpen, RefreshCw, Check, X, Car, Plane, History, Newspaper } from 'lucide-react';
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
      news: `Aktuelle Nachrichten ${new Date().getFullYear()}`
    };
    return queryMap[String(topic)] ?? String(topic);
  };

  const buildTopicQueries = (topic: Topic) => {
    const year = new Date().getFullYear();
    const queryMap: Record<string, string[]> = {
      history: ['Deutsche Geschichte', 'Geschichte Deutschlands', 'Weimarer Republik', 'Deutsches Kaiserreich'],
      f1: ['Formel 1 Weltmeisterschaft', `Formel 1 Saison ${year}`, 'Formel-1-Grand-Prix', 'F1 Rennen'],
      aviation: ['Luftfahrt', 'Flugzeugtechnik', 'Luftverkehr', 'Deutsche Luftfahrtgeschichte'],
      news: [`Aktuelle Nachrichten ${year}`, `Nachrichten Deutschland ${year}`, 'Tagesgeschehen', 'Wikinews Deutschland']
    };
    return queryMap[String(topic)] ?? [String(topic)];
  };

  const extractTextFromHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const raw = doc.body.textContent ?? '';
    return raw.replace(/\s+/g, ' ').trim();
  };

  const sanitizeText = (text: string) => {
    return text
      .replace(/\[[0-9]+\]/g, '')
      .replace(/\s*==+\s*/g, ' ')
      .replace(/\{\{[^}]+\}\}/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/\$[^$]+\$/g, ' ')
      .replace(/\\\[[\s\S]*?\\\]/g, ' ')
      .replace(/\\\([\s\S]*?\\\)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    const slice = text.slice(0, maxLength);
    const lastStop = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
    if (lastStop > 200) return slice.slice(0, lastStop + 1);
    return slice.trim();
  };

  const shuffle = <T,>(items: T[]) => items.sort(() => Math.random() - 0.5);

  const extractNouns = (text: string) => {
    const matches = text.match(/\b[A-ZÄÖÜ][a-zäöüß]{2,}\b/g) ?? [];
    return Array.from(new Set(matches));
  };

  const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

  const buildWordQuestion = (content: string) => {
    const words = Array.from(new Set((content.match(/\b[\p{L}]{6,}\b/gu) ?? []).map(word => word.toLowerCase())));
    const fallbackWords = ['Wissenschaft', 'Regierung', 'Maschine', 'Revolution', 'Vertrag', 'Bewegung', 'Analyse', 'Entwicklung'];
    const usableWords = words.filter(word => word.length >= 6);
    const correct = usableWords.length > 0 ? usableWords[Math.floor(Math.random() * usableWords.length)] : fallbackWords[0].toLowerCase();
    const distractors = usableWords.filter(word => word !== correct).slice(0, 3);
    const needed = 3 - distractors.length;
    const filler = fallbackWords
      .map(word => word.toLowerCase())
      .filter(word => word !== correct && !distractors.includes(word) && !words.includes(word))
      .slice(0, needed);
    const options = shuffle([correct, ...distractors, ...filler]).slice(0, 4);
    const correctIndex = options.indexOf(correct);
    return {
      question: t('reading.question_word'),
      options,
      correctIndex
    };
  };

  const buildEntityQuestion = (content: string) => {
    const nouns = extractNouns(content);
    const fallback = ['Zeitung', 'Stadt', 'Geschichte', 'Politik', 'Technik', 'Kultur', 'Gesellschaft', 'Wirtschaft'];
    const correct = nouns.length > 0 ? pickRandom(nouns) : fallback[0];
    const distractors = nouns.filter(noun => noun !== correct).slice(0, 3);
    const fillers = fallback.filter(noun => noun !== correct && !distractors.includes(noun)).slice(0, 3 - distractors.length);
    const options = shuffle([correct, ...distractors, ...fillers]).slice(0, 4);
    return {
      question: t('reading.question_entity'),
      options,
      correctIndex: options.indexOf(correct)
    };
  };

  const buildSentenceQuestion = (content: string) => {
    const sentences = content.split(/(?<=[.!?])\s+/).map(sentence => sentence.trim()).filter(sentence => sentence.length > 50);
    const nouns = extractNouns(content);
    if (sentences.length === 0 || nouns.length < 2) return null;
    const correctSentence = pickRandom(sentences);
    const sentenceNouns = extractNouns(correctSentence);
    if (sentenceNouns.length === 0) return null;
    const targetNoun = pickRandom(sentenceNouns);
    const otherNouns = nouns.filter(noun => noun !== targetNoun);
    const distractors: string[] = [];
    for (const noun of shuffle(otherNouns).slice(0, 3)) {
      const altered = correctSentence.replace(targetNoun, noun);
      if (!distractors.includes(altered) && altered !== correctSentence) {
        distractors.push(altered);
      }
    }
    if (distractors.length < 3) return null;
    const options = shuffle([correctSentence, ...distractors]).slice(0, 4);
    return {
      question: t('reading.question_sentence'),
      options,
      correctIndex: options.indexOf(correctSentence)
    };
  };

  const buildQuestions = (content: string) => {
    const questions = [buildSentenceQuestion(content), buildEntityQuestion(content), buildWordQuestion(content)].filter(Boolean) as {
      question: string;
      options: string[];
      correctIndex: number;
    }[];
    return questions.slice(0, 3);
  };

  const fetchPrimarySources = async (query: string, topic: Topic | null) => {
    const projects = [
      {
        id: 'wikisource',
        label: 'Wikisource',
        apiUrl: 'https://de.wikisource.org/w/api.php',
        pageUrl: 'https://de.wikisource.org/wiki/'
      },
      {
        id: 'wikinews',
        label: 'Wikinews',
        apiUrl: 'https://de.wikinews.org/w/api.php',
        pageUrl: 'https://de.wikinews.org/wiki/'
      },
      {
        id: 'wikipedia',
        label: 'Wikipedia',
        apiUrl: 'https://de.wikipedia.org/w/api.php',
        pageUrl: 'https://de.wikipedia.org/wiki/'
      }
    ];

    const shuffleProjects = (items: typeof projects) => shuffle([...items]);
    const candidates =
      String(topic) === 'news'
        ? shuffleProjects([projects[1], projects[2], projects[0]])
        : String(topic) === 'f1'
          ? shuffleProjects([projects[2], projects[0]])
          : shuffleProjects([projects[0], projects[2]]);

    const fetchSearchTitles = async (project: typeof projects[number], searchQuery: string) => {
      const offset = Math.floor(Math.random() * 4);
      const searchUrl = `${project.apiUrl}?origin=*&action=query&format=json&list=search&srlimit=8&sroffset=${offset}&srnamespace=0&srsort=last_edit_desc&srsearch=${encodeURIComponent(searchQuery)}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      return (searchData?.query?.search ?? []).map((item: { title: string }) => item.title);
    };

    const fetchRecentWikinewsTitles = async (): Promise<string[]> => {
      const recentUrl = `${projects[1].apiUrl}?origin=*&action=query&format=json&list=recentchanges&rclimit=10&rcnamespace=0&rcshow=!redirect&rcprop=title|timestamp`;
      const recentResponse = await fetch(recentUrl);
      const recentData: { query?: { recentchanges?: { title: string }[] } } = await recentResponse.json();
      return Array.from(new Set((recentData.query?.recentchanges ?? []).map(item => item.title)));
    };

    const fetchSourcesFromTitles = async (project: typeof projects[number], titles: string[]) => {
      const sources: PrimarySource[] = [];
      for (const title of shuffle([...titles])) {
        const parseUrl = `${project.apiUrl}?origin=*&action=parse&format=json&formatversion=2&page=${encodeURIComponent(title)}&prop=text`;
        const parseResponse = await fetch(parseUrl);
        const parseData = await parseResponse.json();
        const html = typeof parseData?.parse?.text === 'string'
          ? parseData.parse.text
          : parseData?.parse?.text?.['*'] ?? '';
        const text = sanitizeText(truncateText(extractTextFromHtml(html), 1800));
        if (!text || text.length < 200) continue;
        sources.push({
          title,
          url: `${project.pageUrl}${encodeURIComponent(title.replace(/ /g, '_'))}`,
          excerpt: truncateText(text, 320),
          content: text,
          source: project.label
        });
        if (sources.length >= 2) break;
      }
      return sources;
    };

    const queries = topic ? buildTopicQueries(topic) : [query];

    const aggregated: PrimarySource[] = [];
    const seen = new Set<string>();

    if (String(topic) === 'news') {
      const wikinewsTitles = await fetchRecentWikinewsTitles();
      if (wikinewsTitles.length > 0) {
        const newsSources = await fetchSourcesFromTitles(projects[1], wikinewsTitles);
        for (const source of newsSources) {
          const key = `${source.source}:${source.title}`;
          if (seen.has(key)) continue;
          seen.add(key);
          aggregated.push(source);
        }
      }
    }

    for (const project of candidates) {
      for (const searchQuery of shuffle([...queries])) {
        const titles = await fetchSearchTitles(project, searchQuery);
        if (titles.length === 0) continue;
        const sources = await fetchSourcesFromTitles(project, titles);
        for (const source of sources) {
          const key = `${source.source}:${source.title}`;
          if (seen.has(key)) continue;
          seen.add(key);
          aggregated.push(source);
        }
        if (aggregated.length >= 2) return aggregated.slice(0, 2);
      }
    }
    return aggregated.slice(0, 2);
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
      const dbReadings = await fetchReadingsFromSupabase(topic, 10);
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

      // 2. Fallback to Live Sources
      const sources = await fetchPrimarySources(buildTopicQuery(topic), topic);
      if (sources.length === 0) {
        throw new Error('No sources');
      }
      const content = sources.map(item => item.content).join('\n\n');
      const questions = buildQuestions(content);
      setCurrentText({
        id: Math.random().toString(36).slice(2),
        title: sources[0]?.title ?? String(topic),
        content,
        topic,
        questions,
        sources
      });
      setSelectedAnswers(Array(questions.length).fill(null));
      setShowFeedback(Array(questions.length).fill(false));
    } catch (e) {
      console.error(e);
      // 3. Fallback to Local Generation
      const generated = generateContextReadingText(topic);
      setCurrentText(generated);
      setSelectedAnswers(Array(generated.questions.length).fill(null));
      setShowFeedback(Array(generated.questions.length).fill(false));
      setErrorMessage(null);
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
      const sources = await fetchPrimarySources(query, null);
      if (sources.length === 0) {
        throw new Error('No sources');
      }
      const content = sources.map(item => item.content).join('\n\n');
      const questions = buildQuestions(content);
      setCurrentText({
        id: Math.random().toString(36).slice(2),
        title: sources[0]?.title ?? query,
        content,
        topic: query,
        questions,
        sources
      });
      setSelectedAnswers(Array(questions.length).fill(null));
      setShowFeedback(Array(questions.length).fill(false));
    } catch (e) {
      setCurrentText(null);
      setErrorMessage(t('reading.no_sources'));
      console.error(e);
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
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
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
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-card text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-5 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
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
