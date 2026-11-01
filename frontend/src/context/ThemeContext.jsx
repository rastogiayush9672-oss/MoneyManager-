import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mm_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const applyTheme = (resolvedTheme) => {
      root.setAttribute('data-theme', resolvedTheme);
      body.className = resolvedTheme === 'dark' ? 'theme-dark' : 'theme-light';
    };

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemDark ? 'dark' : 'light');

      const listener = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    } else {
      applyTheme(theme);
    }

    localStorage.setItem('mm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark'));
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
