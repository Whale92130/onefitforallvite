import  { CSSProperties, useEffect, useState } from 'react'; // Import CSSProperties for type checking styles

// --- Asset Imports ---
// Use standard ES module imports for assets in Vite.
// Adjust these paths based on your actual project structure.
import logoImage from '/home/user/onefitforallvite/src/assets/icons/logo.jpeg';
import fireImage from '/home/user/onefitforallvite/src/assets/images/fire.png';

// --- Colors Import ---
// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors properties with actual color values.
//import { Colors } from './colors'; // Adjust path as needed
import {useTheme} from './ThemeContext';

import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';


// --- TopBar Component ---

const TopBar = () => {
  const { theme, themeName } = useTheme();
// --- Styles Definition ---
const styles: { [key: string]: CSSProperties } = {
  // Replaces SafeAreaView - mainly for background color and potential top padding
  topBarWrapper: {
    backgroundColor: theme.background || '#ffffff', // Provide fallback color
    height: "10%",
    display: "block"
    // Add padding top if you need to manually simulate safe area space
    // paddingTop: 'env(safe-area-inset-top)', // This uses CSS env variables, support varies
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding: 10,
    width: '100%',
    height: "100%",
    boxSizing: 'border-box', // Include padding in the width calculation
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: '50%', // Use '50%' for a perfect circle
    // backgroundColor: Colors.background, // Usually not needed for <img> unless it's a placeholder
    objectFit: 'cover', // Control how the image fits
    display: 'block', // Remove potential extra space below image
  },
  streakContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary || '#f0f0f0', // Provide fallback color
    padding: 8,
    borderRadius: 15,
  },
  // Specific style for the fire icon image
  fireIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    display: 'block',
    filter: themeName === 'light'
        ? 'grayscale(100%) brightness(40%) contrast(100%)' // Tint dark on light theme
        : 'invert(100%) brightness(2000%) contrast(90%)',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary || '#333333', // Provide fallback color
    lineHeight: '1', // Adjust line height to prevent extra vertical space
  },
};
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [streakCount, setStreakCount] = useState(0);
  const [lastLoginAt, setLastLoginAt] = useState<Timestamp | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setStreakCount(data.streakCount || 0);
          setLastLoginAt(data.lastLoginAt || null);

          // Check and update streak on login
          updateStreak(data.lastLoginAt, data.streakCount);
        } else {
          // If user document doesn't exist, create it with initial streak data
          await setDoc(userRef, {
            streakCount: 1,
            lastLoginAt: serverTimestamp(),
          });
          setStreakCount(1);
          // lastLoginAt will be updated on next fetch or by using the return value of setDoc if needed
        }
      }
    };

    fetchUserData();

    // You might want to add an auth state change listener here
    // to refetch data if the user logs in or out while the component is mounted.

  }, [user]); // Re-run effect when user changes

  const updateStreak = async (lastLoginTimestamp: Timestamp | null, currentStreak: number) => {
    if (!user) return;

    const now = Timestamp.now();
    let updatedStreak = currentStreak;

    if (lastLoginTimestamp) {
      const lastLoginDate = lastLoginTimestamp.toDate();
      const today = now.toDate();

      // Check if last login was yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday = lastLoginDate.getDate() === yesterday.getDate() &&
                          lastLoginDate.getMonth() === yesterday.getMonth() &&
                          lastLoginDate.getFullYear() === yesterday.getFullYear();

      // Check if last login was today
      const isToday = lastLoginDate.getDate() === today.getDate() &&
                      lastLoginDate.getMonth() === today.getMonth() &&
                      lastLoginDate.getFullYear() === today.getFullYear();

      if (isYesterday) {
        updatedStreak = currentStreak + 1;
      } else if (!isToday) {
        // If not yesterday and not today, reset streak
        updatedStreak = 1;
      }
      // If it was today, do nothing, streak continues
    } else {
      // First login, start streak
      updatedStreak = 1;
    }

    // Update in database
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      streakCount: updatedStreak,
      lastLoginAt: serverTimestamp(),
    }, { merge: true });

    setStreakCount(updatedStreak);
  };

  return (
    <div style={styles.topBarWrapper}>
      <div style={styles.container}>
        <img
          src={logoImage}
          alt="App Logo"
          style={styles.logo}
        />
        
        <h3>Hello {user?.displayName ?? user?.email ?? "User"}</h3>

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