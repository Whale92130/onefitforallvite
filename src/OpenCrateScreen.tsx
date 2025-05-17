import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OpenCrateScreen.module.css';
import { useTheme } from './ThemeContext';
import { ThemeName } from './colors'; // Import ThemeName

// Firebase Imports
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

interface CrateResult {
  theme: string; // This will be the full display name like "Dark Theme"
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

// Helper function to map full theme names to ThemeName keys
const mapFullThemeToThemeNameKey = (fullThemeName: string): ThemeName | null => {
  switch (fullThemeName) {
    case 'Dark Theme': return 'dark';
    case 'Winter Theme': return 'winter';
    case 'Summer Theme': return 'summer';
    case 'Autumn Theme': return 'autumn';
    case 'Spring Theme': return 'spring';
    case 'Mr. Hare Theme': return 'mrhare';
    case 'CCA Theme': return 'CCA';
    case 'The Nether Theme': return 'nether';
    case 'Midnight Theme': return 'midnight';
    case 'America Theme': return 'america';
    case 'Ender Pearl Theme': return 'enderpearl';
    // Add other mappings if new themes are added to crates
    // e.g. case 'Greyscale Theme': return 'light'; // Or another appropriate ThemeName
    default:
      console.warn(`No ThemeName key mapping found for full theme: ${fullThemeName}`);
      return null;
  }
};

const OpenCrateScreen: React.FC = () => {
  const [lootCrateResult, setLootCrateResult] = useState<CrateResult | null>(null);
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultToDisplay, setResultToDisplay] = useState<CrateResult | null>(null);
  const { theme: currentAppliedTheme, setTheme } = useTheme(); // Get setTheme from context
  const [unlockedThemeKeyForContext, setUnlockedThemeKeyForContext] = useState<ThemeName | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;


  // Initialize Firebase
  const db = getFirestore();

  const saveUnlockedTheme = async (fullThemeName: string) => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user logged in. Cannot save theme.");
      return;
    }
    const userRef = doc(db, "users", user.uid);
    try {
      const userDocSnap = await getDoc(userRef);
      if (userDocSnap.exists()) {
        await updateDoc(userRef, {
          unlockedThemes: arrayUnion(fullThemeName), // Storing the full name
          lastThemeUnlockedAt: serverTimestamp(),
        });
        console.log(`Theme "${fullThemeName}" added to existing user ${user.uid} unlocked themes.`);
      } else {
        await setDoc(userRef, {
          unlockedThemes: [fullThemeName], // Storing the full name
          createdAt: serverTimestamp(),
          lastThemeUnlockedAt: serverTimestamp(),
        }, { merge: true });
        console.log(`Theme "${fullThemeName}" saved for new user entry ${user.uid}.`);
      }
    } catch (error) {
      console.error("Error saving unlocked theme to Firestore:", error);
    }
  };

  const handleOpenCrate = async () => {
    setLootCrateResult(null);
    setResultToDisplay(null);
    setUnlockedThemeKeyForContext(null); // Reset theme key on new open
    setIsAnimating(true);

    let crateResult: CrateResult;
    const roll = Math.random();

    // --- Crate Logic (using full theme names) ---
    if (roll <= 0.60) {
      const themes = ['Dark Theme']; // Only 'Dark Theme' for Common
      crateResult = { theme: themes[Math.floor(Math.random() * themes.length)], rarity: 'Common' };
    } else if (roll <= 0.90) {
      const themes = ['Winter Theme', 'Summer Theme', 'Autumn Theme', 'Spring Theme'];
      crateResult = { theme: themes[Math.floor(Math.random() * themes.length)], rarity: 'Rare' };
    } else if (roll <= 0.98) {
      const themes = ['Mr. Hare Theme', 'CCA Theme', 'The Nether Theme'];
      crateResult = { theme: themes[Math.floor(Math.random() * themes.length)], rarity: 'Epic' };
    } else {
      const themes = ['Midnight Theme', 'America Theme', 'Ender Pearl Theme'];
      crateResult = { theme: themes[Math.floor(Math.random() * themes.length)], rarity: 'Legendary' };
    }
    // --- End of Crate Logic ---

    setResultToDisplay(crateResult);

    if (crateResult?.theme) {
      // Save the full theme name (e.g., "Dark Theme") to Firestore
      await saveUnlockedTheme(crateResult.theme);

      // Map the full theme name to its ThemeName key for context usage
      const themeKey = mapFullThemeToThemeNameKey(crateResult.theme);
      if (themeKey) {
        setUnlockedThemeKeyForContext(themeKey);
      }
    }
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    if (resultToDisplay) {
      setLootCrateResult(resultToDisplay);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'Common': return 'green';
      case 'Rare': return 'blue';
      case 'Epic': return 'purple';
      case 'Legendary': return 'orange';
      default: return 'gray';
    }
  };

  const getThemeBackgroundColor = (fullThemeName: string): string => {
    // This function still uses full theme names for display consistency
    switch (fullThemeName) {
      case 'Dark Theme': return '#292929';
      case 'Winter Theme': return '#90c0e8';
      case 'Summer Theme': return '#ffe51f';
      case 'Autumn Theme': return '#c93c00';
      case 'Spring Theme': return '#80d162';
      case 'Mr. Hare Theme': return '#ffff00';
      case 'CCA Theme': return '#b52400';
      case 'The Nether Theme': return '#ff6200';
      case 'Midnight Theme': return '#000000';
      case 'America Theme': return '#ff0022';
      case 'Ender Pearl Theme': return '#1b0042';
      default: return 'transparent';
    }
  };

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsUserLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, [auth]);

  if (!isUserLoggedIn) {
    return (
      <div className={styles.container} style={{ backgroundColor: currentAppliedTheme.background, color: currentAppliedTheme.textPrimary, textAlign: 'center', paddingTop: '50px' }}>
        <p>Please sign in to open crates and save your themes.</p>
        <button onClick={() => navigate('/signin')} className={styles.button}>Sign In</button>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ backgroundColor: currentAppliedTheme.background }}>
      <div className={styles.contentContainer}>
        {!isAnimating && lootCrateResult ? (
          <>
            <p className={styles.themeText} style={{ color: currentAppliedTheme.textPrimary }}>You got: {lootCrateResult.theme}</p>
            <div
              className={styles.square}
              style={{ backgroundColor: getThemeBackgroundColor(lootCrateResult.theme) }}
            />
            <p style={{ color: getRarityColor(lootCrateResult.rarity) }} className={styles.rarityText}>
              {lootCrateResult.rarity}
            </p>
          </>
        ) : (
          <div className={styles.placeholder}></div>
        )}
      </div>

      {isAnimating && (
        <img
          src={"/crate.png"}
          alt="Crate opening"
          className={`${styles.crateImage} ${styles.crateAnimating}`}
          onAnimationEnd={handleAnimationEnd}
        />
      )}

      {!isAnimating && lootCrateResult && (
        <div className={styles.buttonContainer}>
          <button className={`${styles.button} ${styles.claimButton}`} onClick={() => {
            console.log('Claim pressed. Theme already saved.');
            navigate('/');
          }}>
            Claim
          </button>
          <button
            className={`${styles.button} ${styles.claimAndEquipButton}`}
            onClick={async () => { // Make the onClick handler async
              if (unlockedThemeKeyForContext) {
                try {
                  console.log(`Attempting to set and save theme: "${unlockedThemeKeyForContext}"`);
                  await setTheme(unlockedThemeKeyForContext); // Await the theme save operation
                  if(!user) return;
                  const userRef = doc(db, "users", user.uid);
                  await setDoc(
                    userRef,
                    {
                      theme: unlockedThemeKeyForContext,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }  // only updates these fields
                  );
                  console.log(`Claim and Equip: Theme set to "${unlockedThemeKeyForContext}" and save successful.`);
                } catch (error) {
                  console.error("Claim and Equip: Failed to save theme.", error);
                  // Optionally, handle the error (e.g., show a message to the user)
                  // You might choose not to navigate if saving fails.
                }
              } else {
                console.warn("Claim and Equip: No valid theme key to set.");
              }
              // Navigate AFTER the await setTheme completes (or fails and is handled)
              navigate('/');
            }}
          >
            Claim and Equip
          </button>
        </div>
      )}

      {!isAnimating && (
        <div className={styles.openAnotherButtonContainer}>
          <button className={styles.openButton} onClick={handleOpenCrate}>
            {lootCrateResult ? 'Open Another' : 'Open Crate'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OpenCrateScreen;