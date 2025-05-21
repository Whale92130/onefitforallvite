// src/SettingsPage.tsx
import { CSSProperties, useEffect, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";
import useFirebase from "./useFirebase"; // Assuming this is for signout, keep if needed
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useTheme } from "./ThemeContext";
import { ThemeName } from "./colors"; // Your existing ThemeName type
import SignInPage from "./signInPage";

// Define the mapping from Full Theme Name (from DB) to ThemeName key (from colors.ts)
// and the display name for the button.
// This replaces the external themeDefinitions.ts
const ALL_THEME_CONFIGS: { key: ThemeName; fullName: string; displayName: string }[] = [
  { key: 'light', fullName: 'Light Theme', displayName: 'Light Theme' }, // Assuming 'Greyscale Theme' is your 'light'
  { key: 'dark', fullName: 'Dark Theme', displayName: 'Dark Theme' },
  { key: 'winter', fullName: 'Winter Theme', displayName: 'Winter Theme' },
  { key: 'CCA', fullName: 'CCA Theme', displayName: 'CCA Theme' },
  { key: 'spring', fullName: 'Spring Theme', displayName: 'Spring Theme' },
  { key: 'autumn', fullName: 'Autumn Theme', displayName: 'Autumn Theme' },
  { key: 'summer', fullName: 'Summer Theme', displayName: 'Summer Theme' },
  { key: 'mrhare', fullName: 'Mr. Hare Theme', displayName: 'Mr. Hare Theme' },
  { key: 'nether', fullName: 'The Nether Theme', displayName: 'The Nether Theme' },
  { key: 'midnight', fullName: 'Midnight Theme', displayName: 'Midnight Theme' },
  { key: 'america', fullName: 'America Theme', displayName: 'America Theme' },
  { key: 'enderpearl', fullName: 'Ender Pearl Theme', displayName: 'Ender Pearl Theme' },
  // Add 'goodBoy' if it has a corresponding full name from crates/DB
  // { key: 'goodBoy', fullName: 'Good Boy Theme', displayName: 'Good Boy Theme' },
];

// Helper to get ThemeName key from full name (used for DB values)
const mapFullNameToThemeKey = (fullName: string): ThemeName | null => {
  const config = ALL_THEME_CONFIGS.find(tc => tc.fullName === fullName);
  return config ? config.key : null;
};

// Helper to get display name for a theme key
const getThemeDisplayName = (themeKey: ThemeName): string => {
    const config = ALL_THEME_CONFIGS.find(tc => tc.key === themeKey);
    return config ? config.displayName : themeKey.charAt(0).toUpperCase() + themeKey.slice(1); // Fallback
};

// Define default themes that are always considered unlocked by their KEY
const DEFAULT_UNLOCKED_THEME_KEYS: ThemeName[] = ['light'];

const SettingsPage = () => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const [showAbout, setShowAbout] = useState(false);
  const { signout } = useFirebase();

  const { theme, setTheme: setContextTheme, themeName } = useTheme(); // themeName is the key of the *currently applied* theme
  const [loading, setLoading] = useState(true);
  const [unlockedThemeKeys, setUnlockedThemeKeys] = useState<ThemeName[]>([...DEFAULT_UNLOCKED_THEME_KEYS]);

  const btnStyle: CSSProperties = {
    margin: 8,
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  };

  // Stable setTheme function for dependency arrays
  const setTheme = useCallback(async (newThemeName: ThemeName) => {
    // setContextTheme comes from useTheme and should ideally be stable or memoized in ThemeContext
    // If setContextTheme itself causes re-renders that break this, ThemeContext needs adjustment
    await setContextTheme(newThemeName);
  }, [setContextTheme]);


  // 1) Load saved applied theme AND unlocked themes on mount/user change
  useEffect(() => {
    if (!user) {
      setUnlockedThemeKeys([...DEFAULT_UNLOCKED_THEME_KEYS]);
      if (!DEFAULT_UNLOCKED_THEME_KEYS.includes(themeName)) {
         setTheme(DEFAULT_UNLOCKED_THEME_KEYS[0]);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      let currentAppliedKeyFromDB: ThemeName = DEFAULT_UNLOCKED_THEME_KEYS[0];
      let resolvedUnlockedKeys: ThemeName[] = [...DEFAULT_UNLOCKED_THEME_KEYS];

      if (snap.exists()) {
        const data = snap.data();
        if (data.theme && typeof data.theme === "string") {
          currentAppliedKeyFromDB = data.theme as ThemeName;
        }
        if (data.unlockedThemes && Array.isArray(data.unlockedThemes)) {
          const dbUnlockedFullNames = data.unlockedThemes as string[];
          const mappedKeys = dbUnlockedFullNames
            .map(fullName => mapFullNameToThemeKey(fullName))
            .filter(key => key !== null) as ThemeName[];
          resolvedUnlockedKeys = Array.from(new Set([...resolvedUnlockedKeys, ...mappedKeys]));
        }
      }
      
      setUnlockedThemeKeys(resolvedUnlockedKeys);

      let themeToActuallyApply = DEFAULT_UNLOCKED_THEME_KEYS[0];
      if (resolvedUnlockedKeys.includes(currentAppliedKeyFromDB)) {
        themeToActuallyApply = currentAppliedKeyFromDB;
      } else if (resolvedUnlockedKeys.length > 0) {
        themeToActuallyApply = resolvedUnlockedKeys[0];
      }
      
      if (themeName !== themeToActuallyApply) {
        // Use the local stable setTheme
        await setTheme(themeToActuallyApply);
      }
      setLoading(false);
    })();
  }, [user, db, setTheme, themeName]); // themeName added for consistency

  // 2) When themeName (currently applied theme key) changes, save to Firestore
  useEffect(() => {
    if (!user || loading) return;

    // Safety check: ensure themeName is a known key
    if (!ALL_THEME_CONFIGS.some(config => config.key === themeName)) {
        console.warn(`SettingsPage: Attempted to save an unknown theme key: ${themeName}`);
        return;
    }

    const save = async () => {
      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(
          userRef,
          {
            theme: themeName, // Save the key of the applied theme
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log(`SettingsPage: Applied theme "${themeName}" saved to Firestore.`);
      } catch (error) {
        console.error("SettingsPage: Error saving applied theme:", error);
      }
    };
    save();
  }, [user, db, themeName, loading]);

  const handleSignOut = () => {
    if (signout) signout();
    else console.error("Firebase signout function is not available.");
  };
  const handleAboutClick = () => setShowAbout(!showAbout);

  if (!user) return (
    <>
      <p style={{ textAlign: 'center', padding: 20, background: theme.background, color: theme.textPrimary }}>
        Please sign in to change your settings.
      </p>
      <SignInPage />
    </>
  );

  if (loading) return <div style={{ padding: 20, background: theme.background, color: theme.textPrimary }}>Loading your settings…</div>;

  // Filter ALL_THEME_CONFIGS to only those whose keys are in unlockedThemeKeys
  const displayableThemes = ALL_THEME_CONFIGS.filter(config =>
    unlockedThemeKeys.includes(config.key)
  );

  return (
    <div style={{ padding: 20, background: theme.background, color: theme.textPrimary, overflowY: 'auto' }}>
      <h1>Settings</h1>
      <h2>{getThemeDisplayName(themeName)}</h2>

      {displayableThemes.length > 0 ? displayableThemes.map((config) => (
        <button
          key={config.key}
          onClick={async () => await setTheme(config.key)} // Use local stable setTheme
          disabled={themeName === config.key}
          style={{
            ...btnStyle,
            background: theme.button,
            color: theme.textSecondary,
            opacity: themeName === config.key ? 0.6 : 1,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {config.displayName}
        </button>
      )) : <p>No themes unlocked yet, or an error occurred. The default theme is active.</p>}
      
      <br /><br /><br />
      <button style={{WebkitTapHighlightColor: 'transparent', background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleAboutClick}>
        {showAbout ? "Hide" : "Show"} About 1Fit4All
      </button>

      {showAbout && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: theme.secondary, color: theme.textSecondary, borderRadius: '20px' }}>
          <p>
            At Good Boy Inc., we’re more than just developers — we’re a team brought together by a shared mission: to help people feel stronger, happier, and healthier every single day.
          </p>
          <p>Thanks to Jackson for helping us when times were tough.</p>
          <p>
            Stay strong. Stay good.
            — The Good Boy Inc. Team.
          </p>
        </div>
      )}
      <br />
      <button style={{ ...btnStyle, background: theme.button, color: theme.textSecondary,WebkitTapHighlightColor: 'transparent', }} onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
};

export default SettingsPage;