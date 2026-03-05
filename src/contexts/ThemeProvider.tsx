import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeContext } from './themeContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
