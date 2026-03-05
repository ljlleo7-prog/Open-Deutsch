import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Check, Plane, History, Newspaper, Car } from 'lucide-react';
import { clsx } from 'clsx';
import { Topic } from '../types';
import { useI18n } from '../hooks/useI18n';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const { language, setLanguage, t } = useI18n();

  const topics: { id: Topic; label: string; icon: React.ElementType }[] = [
    { id: 'history', label: t('topics.history'), icon: History },
    { id: 'f1', label: t('topics.f1'), icon: Car },
    { id: 'aviation', label: t('topics.aviation'), icon: Plane },
    { id: 'news', label: t('topics.news'), icon: Newspaper },
  ];

  const toggleTopic = (topicId: Topic) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = async () => {
    if (selectedTopics.length === 0) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save preferences to Supabase
        const interests = selectedTopics.map(topic => ({
          user_id: user.id,
          topic,
          weight: 1.0
        }));

        const { error } = await supabase
          .from('opendeutsch_user_interests')
          .upsert(interests);

        if (error) throw error;
      } else {
        // If no user (guest mode), maybe save to local storage or just proceed
        // For now, we assume this is just UI flow demo if not logged in
        console.log('Guest user preferences:', { selectedTopics, language });
      }

      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('onboarding.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('onboarding.subtitle')}
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('onboarding.topics_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={clsx(
                    "relative flex items-center p-4 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-gray-300 bg-card"
                  )}
                >
                  <div className={clsx(
                    "p-2 rounded-md mr-4",
                    isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  )}>
                    <Icon size={24} />
                  </div>
                  <span className={clsx(
                    "font-medium",
                    isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300"
                  )}>
                    {topic.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-primary">
                      <Check size={20} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('onboarding.language_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={clsx(
                "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors",
                language === 'en'
                  ? "border-german-gold bg-german-gold/10 text-yellow-900 dark:text-yellow-500"
                  : "border-border hover:bg-gray-50 text-gray-700 dark:text-gray-300"
              )}
            >
              {t('language.en')}
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={clsx(
                "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors",
                language === 'zh'
                  ? "border-german-gold bg-german-gold/10 text-yellow-900 dark:text-yellow-500"
                  : "border-border hover:bg-gray-50 text-gray-700 dark:text-gray-300"
              )}
            >
              {t('language.zh')}
            </button>
            <button
              onClick={() => setLanguage('de')}
              className={clsx(
                "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors",
                language === 'de'
                  ? "border-german-gold bg-german-gold/10 text-yellow-900 dark:text-yellow-500"
                  : "border-border hover:bg-gray-50 text-gray-700 dark:text-gray-300"
              )}
            >
              {t('language.de')}
            </button>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={handleSubmit}
            disabled={selectedTopics.length === 0 || loading}
            className={clsx(
              "w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md transition-all",
              selectedTopics.length > 0
                ? "bg-german-red hover:bg-red-700 shadow-german-red/20"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {loading ? t('onboarding.saving') : t('onboarding.start_learning')}
          </button>
          {selectedTopics.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {t('onboarding.topic_required')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
