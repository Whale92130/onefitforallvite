// ThemeSwitcher.tsx
import React from 'react';
import { useTheme } from './ThemeContext'; // Adjust path
import { ThemeName, themes } from './colors'; // To get all available theme names

const ThemeSwitcher: React.FC = () => {
  const { setTheme, themeName } = useTheme();

  // Get all available theme keys from your themes object
  const availableThemes = Object.keys(themes) as ThemeName[];

  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px dashed grey' }}>
      <p>Select Theme (current: {themeName}):</p>
      {availableThemes.map((name) => (
        <button
          key={name}
          onClick={() => setTheme(name)}
          disabled={name === themeName}
          style={{ marginRight: '10px' }}
        >
          {name.charAt(0).toUpperCase() + name.slice(1)} {/* Capitalize first letter */}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;