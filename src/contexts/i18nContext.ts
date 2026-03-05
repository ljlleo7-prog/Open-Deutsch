import { createContext } from 'react';
import { UiLanguage } from '../i18n/translations';

export type I18nContextValue = {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
