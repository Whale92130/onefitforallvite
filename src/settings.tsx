import { useState, useEffect } from "react";
import useFirebase from "./useFirebase"; // Assuming this hook is correctly set up
import { useTheme } from "./ThemeContext"; // Make sure this path is correct for your ThemeProvider file
import { ThemeName } from "./colors"; // Import ThemeName if you need to be explicit, though setTheme should be typed

// const themeOrder = ['light', 'dark', 'goodBoy', 'CCA'] as const; // Not strictly needed here if ThemeName is imported
// type ThemeName = typeof themeOrder[number]; // This type should come from your colors.ts or ThemeContext

const SettingsPage = () => {
  const [showAbout, setShowAbout] = useState(false);
  const { signout } = useFirebase();

  // 1. Destructure `setTheme` and `themeName` from useTheme
  const { theme, setTheme, themeName } = useTheme();

  // 2. The useEffect is not strictly necessary for theme changes IF:
  //    - Your ThemeProvider correctly re-renders its children when the theme state changes.
  //    - All your styling is done through the `theme` object (e.g., inline styles or styled-components).
  //    If you needed to, say, set a class on the <body> element, then useEffect would be useful.
  // useEffect(() => {
  //   console.log("Theme changed to:", themeName);
  //   // If you need to do side effects like changing document.body.className, do it here.
  //   // document.body.className = `theme-${themeName}`;
  // }, [themeName]); // Depend on themeName as it's more direct for "which theme is active"

  const handleSignOut = () => {
    if (signout) { // Good practice to check if signout exists
      signout();
    } else {
      console.error("Firebase signout function is not available.");
    }
  };

  // 3. Correct the button handlers to use the `setTheme` from context
  //    And ensure the labels match the action.

  // You can remove these handlers and call setTheme directly in onClick if you prefer
  // const handleSetLightThemeClick = () => {
  //   setTheme('light');
  // };
  // const handleSetDarkThemeClick = () => {
  //   setTheme('dark');
  // };
  // const handleSetGoodBoyThemeClick = () => {
  //   setTheme('goodBoy');
  // };
  // const handleSetCCAThemeClick = () => {
  //   setTheme('CCA');
  // };


  const handleAboutClick = () => {
    setShowAbout(!showAbout);
  };

  return (
    <div style={{ background: theme.background, color: theme.textPrimary, minHeight: '100vh', padding: '1rem', transition: 'background 0.3s, color 0.3s' }}>
      <h1 style={{ color: theme.textPrimary }}>Settings (Current: {themeName})</h1>
      <button style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleSignOut}>
        Sign Out
      </button>
      
      {/* Theme Switching Buttons */}
      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'light' ? 0.7 : 1 }}
        onClick={() => setTheme('light')} // Directly call setTheme
        disabled={themeName === 'light'}
      >
        Light Theme
      </button>
      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'dark' ? 0.7 : 1 }}
        onClick={() => setTheme('dark')} // Directly call setTheme
        disabled={themeName === 'dark'}
      >
        Dark Theme
      </button>
      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'winter' ? 0.7 : 1 }}
        onClick={() => setTheme('winter')} // Directly call setTheme
        disabled={themeName === 'winter'}
      >
        Winter Theme
      </button>
      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'CCA' ? 0.7 : 1 }}
        onClick={() => setTheme('CCA')} // Directly call setTheme
        disabled={themeName === 'CCA'}
      >
        CCA Theme
      </button>

      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'spring' ? 0.7 : 1 }}
        onClick={() => setTheme('spring')} // Directly call setTheme
        disabled={themeName === 'spring'}
      >
        Spring Theme
      </button>

      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'autumn' ? 0.7 : 1 }}
        onClick={() => setTheme('autumn')} // Directly call setTheme
        disabled={themeName === 'autumn'}
      >
        Autumn Theme
      </button>

      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'summer' ? 0.7 : 1 }}
        onClick={() => setTheme('summer')} // Directly call setTheme
        disabled={themeName === 'summer'}
      >
        Summer Theme
      </button>
     
      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'mrhare' ? 0.7 : 1 }}
        onClick={() => setTheme('mrhare')} // Directly call setTheme
        disabled={themeName === 'mrhare'}
      >
        Mr. Hare Theme
      </button>

      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'nether' ? 0.7 : 1 }}
        onClick={() => setTheme('nether')} // Directly call setTheme
        disabled={themeName === 'nether'}
      >
        THE NETHER Theme
      </button>

      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'midnight' ? 0.7 : 1 }}
        onClick={() => setTheme('midnight')} // Directly call setTheme
        disabled={themeName === 'midnight'}
      >
        Midnight Theme
      </button>

      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'america' ? 0.7 : 1 }}
        onClick={() => setTheme('america')} // Directly call setTheme
        disabled={themeName === 'america'}
      >
        America Theme
      </button>


      <button
        style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: themeName === 'enderpearl' ? 0.7 : 1 }}
        onClick={() => setTheme('enderpearl')} // Directly call setTheme
        disabled={themeName === 'enderpearl'}
      >
        Ender Pearl Theme
      </button>

      <button style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleAboutClick}>
        {showAbout ? "Hide" : "Show"} About 1Fit4All
      </button>

      
      


      {showAbout && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: theme.secondary, color: theme.textPrimary, borderRadius: '4px' }}>
          <p>
            At Good Boy Inc., we’re more than just developers — we’re a team brought together by a shared mission: to help people feel stronger, happier, and healthier every single day.
          </p>
          {/* ... rest of your about text ... */}
          <p>
            Stay strong. Stay good.
            — The Good Boy Inc. Team.
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;