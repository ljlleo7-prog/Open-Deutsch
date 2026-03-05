import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, PenTool } from 'lucide-react';
import { fetchUserProfile } from '../lib/db';
import { useI18n } from '../hooks/useI18n';

export default function Home() {
  const { t } = useI18n();
  const [officialLevel, setOfficialLevel] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchUserProfile().then(profile => {
      setOfficialLevel(profile?.official_level ?? null);
    });
  }, []);

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-card rounded-lg shadow-sm border border-border p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('home.welcome_title')}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t('home.welcome_subtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/exercises" 
            className="flex items-center justify-between p-4 bg-german-red/10 border border-german-red/20 rounded-lg hover:bg-german-red/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-german-red text-white rounded-md">
                <PenTool size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('home.start_exercises_title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.start_exercises_desc')}</p>
              </div>
            </div>
            <ArrowRight className="text-german-red group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/reading" 
            className="flex items-center justify-between p-4 bg-german-gold/10 border border-german-gold/20 rounded-lg hover:bg-german-gold/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-german-gold text-black rounded-md">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('home.explore_reading_title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.explore_reading_desc')}</p>
              </div>
            </div>
            <ArrowRight className="text-yellow-700 dark:text-yellow-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/placement" 
            className="flex items-center justify-between p-4 bg-blue-100/70 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-md">
                <PenTool size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('home.placement_title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.placement_desc')}</p>
              </div>
            </div>
            <ArrowRight className="text-blue-700 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-2">{t('home.official_level')}</h2>
          {officialLevel ? (
            <div className="text-4xl font-bold text-primary">{officialLevel}</div>
          ) : (
            <div className="text-lg text-muted-foreground">{t('home.level_unknown')}</div>
          )}
        </div>

        <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-2">{t('home.grammar_mastery')}</h2>
          <div className="text-lg text-muted-foreground">{t('home.no_data')}</div>
          <p className="text-sm text-muted-foreground mt-1">{t('home.needs_practice')}</p>
        </div>

        <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-2">{t('home.vocab_size')}</h2>
          <div className="text-lg text-muted-foreground">{t('home.no_data')}</div>
          <p className="text-sm text-muted-foreground mt-1">{t('home.words_learned')}</p>
        </div>
      </section>
    </div>
  );
}
