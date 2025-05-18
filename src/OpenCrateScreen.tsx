import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OpenCrateScreen.module.css';
import { useTheme } from './ThemeContext';
import { ThemeName } from './colors';

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
  increment,
} from "firebase/firestore";

interface CrateResult {
  theme: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

const mapFullThemeToThemeNameKey = (fullThemeName: string): ThemeName | null => {
  // ... (your existing mapping function - keep as is)
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
  const { theme: currentAppliedTheme, setTheme: setContextTheme } = useTheme();
  const [unlockedThemeKeyForContext, setUnlockedThemeKeyForContext] = useState<ThemeName | null>(null);

  const auth = getAuth();
  const db = getFirestore();

  // Combined state for user and initial data loading
  const [currentUser, setCurrentUser] = useState(auth.currentUser); // Initialize with current user
  const [crateCount, setCrateCount] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // True until user state and crates are checked

  const setTheme = useCallback(async (newThemeName: ThemeName) => {
    await setContextTheme(newThemeName);
  }, [setContextTheme]);

  // Effect to handle user authentication state and fetch initial data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user); // Update user state
      if (user) {
        // User is signed in, fetch/initialize crates
        const userRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (typeof data.crateCount === 'number') {
              setCrateCount(data.crateCount);
            } else {
              await updateDoc(userRef, { crateCount: 1, lastCrateCountUpdate: serverTimestamp() });
              setCrateCount(1);
            }
          } else {
            await setDoc(userRef, {
              crateCount: 1,
              createdAt: serverTimestamp(),
            }, { merge: true });
            setCrateCount(1);
          }
        } catch (error) {
          console.error("Error fetching/initializing crate count:", error);
          setCrateCount(0); // Fallback on error
        }
      } else {
        // User is signed out
        setCrateCount(0);
      }
      setIsInitialLoading(false); // Done with initial load (auth check + crate fetch attempt)
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [auth, db]); // Dependencies for the effect


  const saveUnlockedTheme = async (fullThemeName: string) => {
    if (!currentUser) return; // Use currentUser state
    const userRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userRef, {
        unlockedThemes: arrayUnion(fullThemeName),
        lastThemeUnlockedAt: serverTimestamp(),
      });
      console.log(`Theme "${fullThemeName}" added to user ${currentUser.uid}`);
    } catch (error) {
      console.error("Error saving unlocked theme:", error);
    }
  };

  const handleOpenCrate = async () => {
    if (!currentUser) { // Use currentUser state
      alert("Please sign in to open crates.");
      return;
    }
    if (crateCount === null || crateCount <= 0) {
      alert("You have no crates to open!");
      return;
    }

    setCrateCount(prevCount => (prevCount ? prevCount - 1 : 0));
    setLootCrateResult(null);
    setResultToDisplay(null);
    setUnlockedThemeKeyForContext(null);
    setIsAnimating(true);

    const userRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userRef, {
        crateCount: increment(-1),
        lastCrateOpenedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error decrementing crate count:", error);
      alert("An error occurred while updating your crate count. Please try again.");
      setIsAnimating(false);
      setCrateCount(prevCount => (prevCount !== null ? prevCount + 1 : 1));
      return;
    }

    let crateResult: CrateResult;
    const roll = Math.random();
    if (roll <= 0.60) {
      crateResult = { theme: 'Dark Theme', rarity: 'Common' };
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

    setResultToDisplay(crateResult);

    if (crateResult?.theme) {
      await saveUnlockedTheme(crateResult.theme);
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

  const getRarityColor = (rarity: string): string => { /* ... as before ... */ 
    switch (rarity) {
      case 'Common': return 'green';
      case 'Rare': return 'blue';
      case 'Epic': return 'purple';
      case 'Legendary': return 'orange';
      default: return 'gray';
    }
  };
  const getThemeBackgroundColor = (fullThemeName: string): string => { /* ... as before ... */
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

  // Render based on loading state and user
  if (isInitialLoading) {
    return (
      <div className={styles.container} style={{ backgroundColor: currentAppliedTheme.background, color: currentAppliedTheme.textPrimary, textAlign: 'center', paddingTop: '50px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) { // Check the currentUser state
    return (
      <div className={styles.container} style={{ backgroundColor: currentAppliedTheme.background, color: currentAppliedTheme.textPrimary, textAlign: 'center', paddingTop: '50px' }}>
        <p>Please sign in to open crates.</p>
        <button onClick={() => navigate('/signin')} className={styles.button}>Sign In</button>
      </div>
    );
  }

  // User is logged in and initial data (crates) has been fetched/attempted
  return (
    <div className={styles.container} style={{ backgroundColor: currentAppliedTheme.background }}>
      <div className={styles.crateInfo} style={{ color: currentAppliedTheme.textPrimary, textAlign: 'center', marginBottom: '20px' }}>
      </div>

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
            navigate('/');
          }}>
            Claim
          </button>
          <button
            className={`${styles.button} ${styles.claimAndEquipButton}`}
            onClick={async () => {
              if (unlockedThemeKeyForContext && currentUser) { // Use currentUser state
                try {
                  await setTheme(unlockedThemeKeyForContext);
                  const userRef = doc(db, "users", currentUser.uid);
                  await updateDoc(userRef,
                    { theme: unlockedThemeKeyForContext, updatedAt: serverTimestamp() }
                  );
                  console.log(`Claim and Equip: Theme set to "${unlockedThemeKeyForContext}" and saved.`);
                } catch (error) {
                  console.error("Claim and Equip: Failed to save theme.", error);
                }
              } else {
                console.warn("Claim and Equip: No valid theme key or user.");
              }
              navigate('/');
            }}
          >
            Claim and Equip
          </button>
        </div>
      )}

      {!isAnimating && (
        <div className={styles.openAnotherButtonContainer}>
          <button
            className={styles.openButton}
            onClick={handleOpenCrate}
            disabled={isInitialLoading || crateCount === null || crateCount <= 0 || isAnimating} // Added isInitialLoading to disabled check
          >
            {isInitialLoading
              ? 'Loading...'
              : crateCount === 0
              ? 'No Crates Left'
              : lootCrateResult
              ? 'Open Another'
              : 'Open Crate'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OpenCrateScreen;