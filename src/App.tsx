import React, { CSSProperties } from 'react';
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

// --- Colors Import (adjust path as needed) ---
import { FirebaseProvider } from './FirebaseContext';


// Placeholder for NewWorkout page component
const NewWorkoutPage = () => {
  const { theme } = useTheme(); // Get theme for this page if needed
  return (
    <div style={{ padding: 20, textAlign: 'center', background: theme.background, color: theme.textPrimary, minHeight: 'calc(100vh - 60px)' }}>
      <h2>Please don't tab out or your progess will be lost!</h2>
      <NewWorkout />
    </div>
  );
}
const CratesPage = () => {
  const { theme } = useTheme(); // Get theme for this page if needed
  return (
    <div style={{ padding: 20, textAlign: 'center', background: theme.background, color: theme.textPrimary, minHeight: 'calc(100vh - 60px)' }}>
      <OpenCrateScreen />
    </div>
  );
}

const ShopPage = () => {
  const { theme } = useTheme(); // Get theme for this page if needed
  return (
    <div style={{ padding: 20, textAlign: 'center', background: theme.background, color: theme.textPrimary, minHeight: 'calc(100vh - 60px)' }}>
      <h2>Shop Page</h2>
      <p>Coming soon!</p>
    </div>
  );
}


// --- Styles Definition: Make it a function that accepts theme ---
const getStyles = (theme: any): { [key: string]: CSSProperties } => ({ // 'any' for theme for brevity, use your Theme interface ideally
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh', // Use vh for full viewport height
    backgroundColor: theme.background, // Now theme is available
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto', // Allow content to scroll if it overflows
    // paddingBottom: 60, // Navbar is outside this, so padding might not be needed here
  },
  homePageLayout: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: 5,
    // backgroundColor: theme.background, // If HomeContent needs its own background
    // color: theme.textPrimary,
  },
  topSection: {
    marginBottom: 10,
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'row',
    // height: '100%', // This can be tricky, let flex grow handle it
    flexGrow: 1,
    gap: 10,
  },
  bottomItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  profilePageLayout: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: 10,
    // backgroundColor: theme.background,
    // color: theme.textPrimary,
  },
  horizontalButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 0, // Consider adding some gap if needed: theme.spacing.small or similar
    marginTop: 0,
    alignItems: 'center',
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