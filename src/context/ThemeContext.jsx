import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

// ─── Light-only theme — dark mode removed ────────────────────────
export function ThemeProvider({ children }) {
  useEffect(() => {
    // Always force light theme — dark mode is disabled
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('anant_theme', 'light');
  }, []);

  // setTheme is a no-op — kept for API compatibility with existing callers
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
