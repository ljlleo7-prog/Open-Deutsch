import React from 'react';
import { Trophy } from 'lucide-react';
import { fetchAuthUser, fetchUserStats } from '../lib/db';
import { useI18n } from '../hooks/useI18n';

export default function Leaderboard() {
  const { t } = useI18n();
  const [stats, setStats] = React.useState<{ totalXP: number; completedExercises: number } | null>(null);
  const [authUser, setAuthUser] = React.useState<{ email?: string; username?: string } | null>(null);

  React.useEffect(() => {
    fetchUserStats().then(data => {
      if (data) setStats(data);
    });
    fetchAuthUser().then(user => {
      if (!user) {
        setAuthUser(null);
        return;
      }
      setAuthUser({
        email: user.email ?? undefined,
        username: (user.user_metadata?.username as string | undefined) ?? undefined
      });
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <Trophy className="text-primary" /> {t('leaderboard.title')}
      </h1>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">{t('leaderboard.your_profile')}</h2>
        {authUser ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('progress.username_label')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {authUser.username || authUser.email || t('progress.profile_unavailable')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('progress.total_xp')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats ? stats.totalXP : t('progress.no_data')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('progress.completed_exercises')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats ? stats.completedExercises : t('progress.no_data')}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('progress.profile_unavailable')}</p>
        )}
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold mb-3">{t('leaderboard.section_title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t('leaderboard.section_subtitle')}</p>
        <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
          {t('leaderboard.empty_state')}
        </div>
      </div>
    </div>
  );
}
