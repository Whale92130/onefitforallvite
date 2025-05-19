import { CSSProperties, useEffect, useState } from 'react';

// --- Asset Imports ---
import logoImage from '/home/user/onefitforallvite/src/assets/icons/logo.jpeg'; // Adjust path if needed
import fireImage from '/home/user/onefitforallvite/src/assets/images/fire.png';  // Adjust path if needed
import { ThemeName } from './colors'; // Assuming this is correctly pathed
import { useTheme } from './ThemeContext';

import { getAuth, User } from 'firebase/auth'; // Import User type
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

// --- TopBar Component ---
const TopBar = () => {
  const { theme, themeName } = useTheme();
  // ... (iconFilterByTheme and iconFilter logic remains the same)
  const darkTint = 'grayscale(100%) brightness(40%) contrast(100%)';
  const lightTint = 'invert(100%) brightness(2000%) contrast(90%)';
  const iconFilterByTheme: Record<ThemeName, string> = {
    light: darkTint, dark: lightTint, goodBoy: lightTint, CCA: lightTint,
    spring: darkTint, summer: darkTint, winter: darkTint, autumn: lightTint,
    mrhare: darkTint, nether: lightTint, midnight: lightTint, america: darkTint,
    enderpearl: lightTint,
  };
  const iconFilter = iconFilterByTheme[themeName] || darkTint;

  // --- Styles Definition ---
  const styles: { [key: string]: CSSProperties } = {
    topBarWrapper: {
      backgroundColor: theme.background || '#ffffff',
      height: "10%",
      display: "block"
    },
    container: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: "100%",
      boxSizing: 'border-box',
    },
    logo: {
      width: 50,
      height: 50,
      marginLeft: 10,
      borderRadius: '50%',
      objectFit: 'cover',
      display: 'block',
    },
    greetingText: { // Added style for the greeting text
      color: theme.textPrimary || '#333333',
      flexGrow: 1, // Allow text to take available space
      textAlign: 'center', // Center the greeting text
      margin: '0 10px', // Add some margin
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    streakContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary || '#f0f0f0',
      padding: 8,
      borderRadius: 15,
      marginRight: 10,
    },
    fireIcon: {
      width: 20,
      height: 20,
      marginRight: 5,
      display: 'block',
      filter: iconFilter,
    },
    streakText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary || '#333333',
      lineHeight: '1',
    },
  };

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser; // This can be null initially or on auth state change

  const [streakCount, setStreakCount] = useState(0);
  // The 'lastLoginAt' state is used internally for streak logic, not directly for display here.
  const [, setLastLoginAtInternal] = useState<Timestamp | null>(null);

  // This function updates streak based on last login.
  // It now assumes `user` is valid when called (checked in useEffect).
  const updateStreakLogic = async (
    currentUser: User, // Pass current user explicitly
    lastLoginTimestamp: Timestamp | null,
    currentStreak: number
  ) => {
    const now = Timestamp.now();
    let updatedStreak = currentStreak;

    if (lastLoginTimestamp) {
      const lastLoginDate = lastLoginTimestamp.toDate();
      const today = now.toDate();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday = lastLoginDate.getDate() === yesterday.getDate() &&
                          lastLoginDate.getMonth() === yesterday.getMonth() &&
                          lastLoginDate.getFullYear() === yesterday.getFullYear();
      const isToday = lastLoginDate.getDate() === today.getDate() &&
                      lastLoginDate.getMonth() === today.getMonth() &&
                      lastLoginDate.getFullYear() === today.getFullYear();

      if (isYesterday) {
        updatedStreak = currentStreak + 1;
      } else if (!isToday) {
        updatedStreak = 1; // Reset streak
      }
      // If it was today, streak continues, no change to updatedStreak needed here
    } else {
      updatedStreak = 1; // First login or no previous record
    }

    // Update streak count and last login time in Firestore
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, {
      streakCount: updatedStreak,
      lastLoginAt: now, // Use `now` as it's the actual time of this update
    }, { merge: true });

    setStreakCount(updatedStreak); // Update local state for display
    setLastLoginAtInternal(now); // Update internal state
  };


  useEffect(() => {
    const manageUserDocument = async () => {
      if (!user) {
        setStreakCount(0); // Reset local streak display for logged-out user
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userRef);

      // Determine the display name from Firebase Auth, falling back to email
      const authDisplayName = user.displayName || user.email || null;

      if (userDocSnap.exists()) {
        // User document exists
        const firestoreData = userDocSnap.data();
        const currentFirestoreStreak = firestoreData.streakCount || 0;
        const currentFirestoreLastLogin = firestoreData.lastLoginAt as Timestamp | null || null;
        
        setStreakCount(currentFirestoreStreak); // Set initial display from Firestore
        setLastLoginAtInternal(currentFirestoreLastLogin);

        // Call streak logic (which includes Firestore write for streak/lastLoginAt)
        await updateStreakLogic(user, currentFirestoreLastLogin, currentFirestoreStreak);

        // Check and update displayName in Firestore if it's different from auth
        // or if it's null in auth but present in Firestore (to clear it if user removed it)
        if (authDisplayName !== firestoreData.displayName) {
          await setDoc(userRef, { displayName: authDisplayName }, { merge: true });
        }
      } else {
        // User document does not exist, create it (e.g., first login)
        const initialData = {
          streakCount: 1, // Start streak at 1
          lastLoginAt: serverTimestamp(), // Set last login to now using server time
          displayName: authDisplayName, // Save the determined displayName
        };
        await setDoc(userRef, initialData);
        setStreakCount(1); // Update local state for streak display
        // `lastLoginAt` will be set by serverTimestamp, can't set internal state directly to it here
        // It will be read on next load or if manageUserDocument runs again.
      }
    };

    manageUserDocument();

    // Adding auth.onAuthStateChanged listener for real-time user changes
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is signed in or state changed, re-run manageUserDocument
        // The `user` variable from `auth.currentUser` might not update immediately
        // in the closure, so it's safer to call with `authUser` if logic depends on it.
        // However, the `useEffect` dependency on `user` (auth.currentUser) should handle this.
        // For this structure, relying on the `user` in the dependency array is standard.
      } else {
        // User is signed out
        setStreakCount(0);
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount

  }, [user, db]); // Re-run when user object (from auth.currentUser) or db instance changes.

  return (
    <div style={styles.topBarWrapper}>
      <div style={styles.container}>
        <img
          src={logoImage}
          alt="App Logo"
          style={styles.logo}
        />
        
        <h3 style={styles.greetingText}> {/* Apply new style here */}
          Hello, {user?.displayName ?? user?.email ?? "Sign In via Profile then Settings"}
        </h3>

        <div style={styles.streakContainer}>
          <img
            src={fireImage}
            alt="Streak icon"
            style={styles.fireIcon}
          />
          <span style={styles.streakText}>{streakCount}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;