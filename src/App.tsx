import React, { CSSProperties, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, BrowserRouter } from 'react-router-dom';

// --- Import Converted Page/Layout Components ---
import YourNextWorkout from './yourNextWorkout';
import RecommendedWorkouts from './recomendedWorkouts';
import Leaderboard from './leaderboard';
import TopBar from './topbar';
import Navbar, { IconName } from './navbar';
import ProfileScreen from './profile';
import OpenShop from './openShop';
import OpenCrateScreen from './OpenCrateScreen';
import NewWorkout from './NewWorkout';
import OpenCrateButton from './openCrate';
import SettingsPage from './settings';
import { useTheme } from './ThemeContext'; // Correct: Import useTheme
import { ThemeProvider } from './ThemeContext'; // <<<--- ADD THIS: To provide the theme context
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFirebaseContext } from './FirebaseContext';
// --- Colors Import (adjust path as needed) ---
import { FirebaseProvider } from './FirebaseContext';
import {ThemeName} from './colors';


// Placeholder for NewWorkout page component
const NewWorkoutPage = () => {
  const { theme } = useTheme(); // Get theme for this page if needed
  return (
    <div style={{ padding: 20, textAlign: 'center', background: theme.background, color: theme.textPrimary, overflow: 'auto'}}>
      <h2>Please don't tab out or your progess will be lost!</h2>
      <NewWorkout />
    </div>
  );
}
const CratesPage = () => {
  const { theme } = useTheme(); // Get theme for this page if needed
  return (
    <div style={{ padding: 20, textAlign: 'center', background: theme.background, color: theme.textPrimary, minHeight: '100%' }}>
      <OpenCrateScreen />
    </div>
  );
}

const ShopPage = () => {
  const { theme } = useTheme(); // Get theme for this page if needed
  return (
    <div style={{ padding: 20, textAlign: 'center', background: theme.background, color: theme.textPrimary,minHeight: '100%', overflow: 'hidden' }}>
      <h2>Shop Page</h2>
      <p>Coming soon!</p>
    </div>
  );
}


// --- Styles Definition: Make it a function that accepts theme ---
// --- Styles Definition: Make it a function that accepts theme ---
const NAV_HEIGHT = 60;  // px

const getStyles = (theme: any): { [key: string]: CSSProperties } => ({
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',                   // <— full height of root (not 100vh)
    backgroundColor: theme.background,
    overflow: 'auto',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    /* reserve space *and* the iOS bottom‐safe‐area */
    paddingBottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
  },
  homePageLayout: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: 5,
    overflow: 'hidden',
  },
  topSection: {
    flex: '0 0 auto',              // only as tall as content
    marginBottom: 10,
  },
  bottomSection: {
    flex: 1,                       // fill remaining vertical space
    display: 'flex',
    gap: 10,
    overflow: 'hidden',
  },
  bottomItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',              // inner scroll if its content is too big
  },
  profilePageLayout: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: 10,
    overflow: 'hidden',
  },
  horizontalButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing?.small || 8,
    marginTop: 10,
  },
});


// --- Child Components that need styles and theme ---
const HomeContent = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme); // Get styles with current theme
  return (
    <FirebaseProvider> {/* Consider if FirebaseProvider also needs theme */}
      <TopBar /> {/* TopBar needs to use useTheme() internally if it's themed */}
      <div style={styles.homePageLayout}>
        <div style={styles.topSection}>
          <RecommendedWorkouts />
        </div>
        <div style={styles.bottomSection}>
          <div style={styles.bottomItem}>
            <YourNextWorkout />
          </div>
          <div style={styles.bottomItem}>
            <Leaderboard />
          </div>
        </div>
      </div>
    </FirebaseProvider>
  );
};

const ProfileContent = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme); // Get styles with current theme
  const navigate = useNavigate(); // useNavigate should be inside component
  return (
    <div style={styles.profilePageLayout}>
      <ProfileScreen />
      <div style={styles.horizontalButtons}>
        <OpenCrateButton />
        <OpenShop />
      </div>
    </div>
  );
};


// --- Main App Component Wrapper (for BrowserRouter and ThemeProvider) ---
// It's common practice to have a root component that sets up providers.
const AppWrapper = () => {
  return (
    <BrowserRouter>
      <FirebaseProvider> {/* If FirebaseProvider needs to be high up */}
        <ThemeProvider> {/* ThemeProvider should wrap anything that uses useTheme */}
          <App />
        </ThemeProvider>
      </FirebaseProvider>
    </BrowserRouter>
  );
}

// Renamed original App to AppContent or similar, or keep as App
// if AppWrapper is the new default export.
function App() { // This is now the component that uses the theme
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, themeName } = useTheme(); // Call useTheme() here
  const styles = getStyles(theme); // Get styles with the current theme
  const { user, loading: authLoading } = useFirebaseContext();
  const { setTheme } = useTheme();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    // once auth is ready and we have a user, fetch their theme
    if (authLoading || !user) return;

    (async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.theme && typeof data.theme === 'string') {
            setTheme(data.theme as ThemeName);
          }
        }
      } catch (err) {
        console.error('Error loading user theme on startup:', err);
      }
    })();
  }, [authLoading, user, db, setTheme]);

  const getActiveIcon = (): IconName => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/newworkout')) return 'newWorkout';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const handleIconPress = (iconName: IconName) => {
    if (iconName === 'home') navigate('/');
    else navigate(`/${iconName}`);
  };

  return (
    <div style={styles.appContainer}> {/* styles.appContainer now has themed background */}
      <div style={styles.contentArea}>
        <Routes>
          <Route path="/" element={<HomeContent />} />
          <Route path="/newworkout" element={<NewWorkoutPage />} />
          <Route path="/profile" element={<ProfileContent />} />
          <Route path="/crates" element={<CratesPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/settings" element={<SettingsPage />} /> {/* SettingsPage uses useTheme internally */}
        </Routes>
      </div>
      <Navbar
        activeIcon={getActiveIcon()}
        onIconPress={handleIconPress}
        // Pass theme to Navbar if it's not using useTheme() internally
        // Or ensure Navbar uses useTheme()
      />
    </div>
  );
}

export default AppWrapper; // Export the AppWrapper as the main entry point