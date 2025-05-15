// ThemeProvider.tsx (or ThemeContext.tsx)
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Theme, ThemeName, themes } from './colors'; // Adjust path if needed

interface ThemeContextProps {
  theme: Theme;
  setTheme: (themeName: ThemeName) => void;
  themeName: ThemeName;
}

// Create context with a default value that should ideally not be undefined
// Or, if you ensure it's always provided, the undefined check in useTheme is fine.
// For a slightly safer default, you could provide a default theme,
// but the undefined check in useTheme is a common pattern.
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>('light'); // Default theme

  const setTheme = (themeName: ThemeName) => {
    setCurrentThemeName(themeName);
  };

  // Derive the current theme object from the stateful theme name
  const currentThemeObject = themes[currentThemeName];

  return (
    <ThemeContext.Provider value={{ theme: currentThemeObject, setTheme, themeName: currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};