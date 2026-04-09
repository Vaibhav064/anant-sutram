import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const VALID_THEMES = ['dark', 'light', 'system'];

export function ThemeProvider({ children }) {
  // Initialize from localStorage with strict validation
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('anant_theme');
    return VALID_THEMES.includes(saved) ? saved : 'dark';
  });

  // Apply theme to <html> data-theme attribute + localStorage
  const applyTheme = (t) => {
    const resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : t;
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('anant_theme', t);
    setThemeState(t);
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t) => {
    applyTheme(t);
  };

  const isDark = (() => {
    if (theme === 'system') return !window.matchMedia('(prefers-color-scheme: light)').matches;
    return theme === 'dark';
  })();

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
