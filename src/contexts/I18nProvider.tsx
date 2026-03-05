import React, { useMemo, useState } from 'react';
import { translations, UiLanguage } from '../i18n/translations';
import { I18nContext } from './i18nContext';

function resolveInitialLanguage(): UiLanguage {
  const saved = localStorage.getItem('ui_language') as UiLanguage | null;
  if (saved && translations[saved]) {
    return saved;
  }
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('zh')) return 'zh';
  if (browser.startsWith('de')) return 'de';
  return 'en';
}

function formatTemplate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, template);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>(() => resolveInitialLanguage());

  const setLanguage = (next: UiLanguage) => {
    setLanguageState(next);
    localStorage.setItem('ui_language', next);
  };

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dictionary = translations[language] || translations.en;
      const fallback = translations.en[key] || key;
      const value = dictionary[key] || fallback;
      return formatTemplate(value, vars);
    };
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}
