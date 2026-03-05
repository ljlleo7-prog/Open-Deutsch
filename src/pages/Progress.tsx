import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { Trophy, TrendingUp, Calendar, User as UserIcon } from 'lucide-react';
import { fetchAuthUser, fetchSkillMetrics, fetchUserProfile, fetchUserStats } from '../lib/db';
import { useI18n } from '../hooks/useI18n';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

type SkillMetric = {
  skill_type: string;
  mastery_percentage: number;
};

export default function Progress() {
  const { t, language } = useI18n();
  const [stats, setStats] = React.useState<{totalXP: number, completedExercises: number, activity: { completed_at: string }[]} | null>(null);
  const [officialLevel, setOfficialLevel] = React.useState<string | null>(null);
  const [skillMetrics, setSkillMetrics] = React.useState<SkillMetric[]>([]);
  const [authUser, setAuthUser] = React.useState<{ email?: string; username?: string } | null>(null);

  React.useEffect(() => {
    fetchUserStats().then(data => {
      if (data) setStats(data);
    });
    fetchUserProfile().then(profile => {
      setOfficialLevel(profile?.official_level ?? null);
    });
    fetchSkillMetrics().then(setSkillMetrics);
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

  const skillLabelMap: Record<string, string> = {
    word_order: t('skill.word_order'),
    verb_conjugation: t('skill.verb_conjugation'),
    cases: t('skill.cases'),
    vocabulary: t('skill.vocabulary'),
    reading: t('skill.reading')
  };

  const formattedSkillLabels = skillMetrics.map(metric => skillLabelMap[metric.skill_type] || metric.skill_type);
  const skillData = {
    labels: formattedSkillLabels,
    datasets: [
      {
        label: t('progress.skill_breakdown'),
        data: skillMetrics.map(metric => metric.mastery_percentage),
        backgroundColor: 'rgba(255, 204, 0, 0.2)',
        borderColor: 'rgba(255, 204, 0, 1)',
        borderWidth: 2,
      },
    ],
  };

  const last7Days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  const activityCounts = last7Days.map(date => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const count = stats?.activity?.filter(entry => {
      const time = new Date(entry.completed_at).getTime();
      return time >= start.getTime() && time <= end.getTime();
    }).length || 0;
    return count;
  });

  const activityLabels = last7Days.map(date =>
    new Intl.DateTimeFormat(language, { weekday: 'short' }).format(date)
  );

  const activityData = {
    labels: activityLabels,
    datasets: [
      {
        label: t('progress.weekly_activity'),
        data: activityCounts,
        backgroundColor: 'rgba(221, 0, 0, 0.7)',
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <TrendingUp className="text-primary" /> {t('progress.title')}
      </h1>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <UserIcon size={20} />
          </div>
          <h2 className="text-lg font-semibold">{t('progress.profile_title')}</h2>
        </div>
        {authUser ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('progress.username_label')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {authUser.username || authUser.email || t('progress.profile_unavailable')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('progress.email_label')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {authUser.email || t('progress.profile_unavailable')}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 flex items-center gap-4">
          <div className="p-3 bg-german-gold/10 rounded-full text-yellow-700">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('progress.current_level')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {officialLevel || t('progress.no_level')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('progress.total_xp')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? stats.totalXP : t('progress.no_data')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('progress.day_streak')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{t('progress.no_data')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-6">{t('progress.skill_breakdown')}</h2>
          {skillMetrics.length > 0 ? (
            <div className="h-[300px] flex justify-center">
              <Radar 
                data={skillData} 
                options={{
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      ticks: { display: false }
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{t('progress.no_skill_data')}</div>
          )}
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-6">{t('progress.weekly_activity')}</h2>
          {stats?.activity && stats.activity.length > 0 ? (
            <div className="h-[300px]">
              <Bar 
                data={activityData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{t('progress.no_activity_data')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
