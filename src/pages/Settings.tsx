import React from 'react';
import { Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../hooks/useI18n';
import { useThemeContext } from '../hooks/useThemeContext';
import { UiLanguage } from '../i18n/translations';

const languageOptions: { value: UiLanguage; labelKey: string }[] = [
  { value: 'en', labelKey: 'language.en' },
  { value: 'zh', labelKey: 'language.zh' },
  { value: 'de', labelKey: 'language.de' }
];

export default function Settings() {
  const { language, setLanguage, t } = useI18n();
  const { theme, setTheme } = useThemeContext();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-primary" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('settings.language_section')}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{t('settings.language_ui_label')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {languageOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setLanguage(option.value)}
                className={clsx(
                  "py-3 px-4 rounded-lg border-2 font-medium transition-colors",
                  language === option.value
                    ? "border-german-gold bg-german-gold/10 text-yellow-900 dark:text-yellow-500"
                    : "border-border hover:bg-gray-50 text-gray-700 dark:text-gray-300"
                )}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('settings.theme_section')}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{t('settings.theme_label')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={clsx(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium transition-colors",
                theme === 'light'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-gray-50 text-gray-700 dark:text-gray-300"
              )}
            >
              <Sun size={18} />
              {t('settings.theme_light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={clsx(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium transition-colors",
                theme === 'dark'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-gray-50 text-gray-700 dark:text-gray-300"
              )}
            >
              <Moon size={18} />
              {t('settings.theme_dark')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
