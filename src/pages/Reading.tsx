import React, { useState } from 'react';
import { generateReadingText, GeneratedText } from '../lib/generator';
import { Topic } from '../types';
import { BookOpen, RefreshCw, Check, X, Car, Plane, History, Newspaper } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../hooks/useI18n';

export default function Reading() {
  const [currentText, setCurrentText] = useState<GeneratedText | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { t } = useI18n();

  const topics: { id: Topic; label: string; icon: React.ElementType }[] = [
    { id: 'history', label: t('topics.history'), icon: History },
    { id: 'f1', label: t('topics.f1'), icon: Car },
    { id: 'aviation', label: t('topics.aviation'), icon: Plane },
    { id: 'news', label: t('topics.news'), icon: Newspaper },
  ];

  const handleGenerate = (topic: Topic) => {
    try {
      const text = generateReadingText(topic);
      setCurrentText(text);
      setSelectedTopic(topic);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <BookOpen className="text-german-gold" /> {t('reading.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Topic Sidebar */}
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

        {/* Content Area */}
        <div className="lg:col-span-3">
          {currentText ? (
            (() => {
              const topicLabel = topics.find(t => t.id === currentText.topic)?.label || currentText.topic;
              return (
            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-muted-foreground mb-2 uppercase">
                    {topicLabel}
                  </span>
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

              <div className="border-t border-border pt-8">
                <h3 className="text-lg font-semibold mb-4">{t('reading.comprehension_check')}</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <p className="font-medium mb-4">{currentText.questions[0].question}</p>
                  
                  <div className="space-y-3">
                    {currentText.questions[0].options.map((option, idx) => {
                      let btnClass = "w-full text-left px-4 py-3 rounded-lg border transition-all ";
                      
                      if (showFeedback) {
                        if (idx === currentText.questions[0].correctIndex) {
                          btnClass += "bg-green-100 border-green-500 text-green-800";
                        } else if (idx === selectedAnswer) {
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
                          onClick={() => handleAnswer(idx)}
                          disabled={showFeedback}
                          className={btnClass}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showFeedback && idx === currentText.questions[0].correctIndex && (
                              <Check size={18} className="text-green-600" />
                            )}
                            {showFeedback && idx === selectedAnswer && idx !== currentText.questions[0].correctIndex && (
                              <X size={18} className="text-red-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
                {t('reading.select_body')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
