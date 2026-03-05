import { createContext } from 'react';
import { useTheme } from '../hooks/useTheme';

export type ThemeContextValue = ReturnType<typeof useTheme>;

export const ThemeContext = createContext<ThemeContextValue | null>(null);
