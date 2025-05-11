import React, { CSSProperties } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, BrowserRouter } from 'react-router-dom';

// --- Import Converted Page/Layout Components ---
import YourNextWorkout from './yourNextWorkout';
import RecommendedWorkouts from './recomendedWorkouts';
import Leaderboard from './leaderboard';
import TopBar from './topbar';
import Navbar, { IconName } from './navbar';
import ProfileScreen from './profile';
import OpenCrateScreen from './openCrate';
import OpenShopScreen from './openShop'; 
import NewWorkout from './NewWorkout';
import Stopwatch from './stopwatch';

// Placeholder for NewWorkout page component
const NewWorkoutPage = () => <div style={{padding: 20, textAlign: 'center'}}><h2>We're staying strong!</h2>
    {/* Render the NewWorkout component here */}
    <Stopwatch/>
    <NewWorkout />  </div>;
const CratesPage = () => <div style={{padding: 20, textAlign: 'center'}}><h2>Crates Page</h2><p>Crate opening content.</p></div>;
const ShopPage = () => <div style={{padding: 20, textAlign: 'center'}}><h2>Shop Page</h2><p>Shop content.</p></div>;

// --- Colors Import (adjust path as needed) ---
import { Colors } from './colors';

// --- Mock Data ---
const leaderboardData = [
  { name: 'Alice Johnson', workouts: 15 },
  { name: 'Bob Williams', workouts: 20 },
  { name: 'Charlie Brown', workouts: 10 },
];

// Component to render for the Home page
const HomeContent = () => (
  <>
    <TopBar/>
    <div style={styles.homePageLayout}>
      <div style={styles.topSection}>
        <RecommendedWorkouts />
      </div>
      <div style={styles.bottomSection}>
        <div style={styles.bottomItem}>
          <YourNextWorkout />
        </div>
        <div style={styles.bottomItem}>
          <Leaderboard leaderboardData={leaderboardData} />
        </div>
      </div>
    </div>
  </>
);

// Component to render for the Profile page
const ProfileContent = () => (
  <div style={styles.profilePageLayout}>
    <ProfileScreen />
    <div style={styles.horizontalButtons}>
      <OpenCrateScreen />
      <OpenShopScreen />
    </div>
  </div>
);


// --- App Component (Manages routing) ---
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Function to determine the active icon based on the current path
  const getActiveIcon = (): IconName => {
    const path = location.pathname.toLowerCase();
  
    if (path.startsWith('/newworkout')) {
      return 'newWorkout';
    } else if (path.startsWith('/profile')) {
      return 'profile';
    } else {
      return 'home';
    }
  };

  const handleIconPress = (iconName: IconName) => {
    if (iconName === 'home') {
      navigate('/');
    } else {
      navigate(`/${iconName}`);
    }
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.contentArea}>
        <Routes>
          <Route path="/" element={<HomeContent />} />
          <Route path="/NewWorkout" element={<NewWorkoutPage/>} />
          <Route path="/profile" element={<ProfileContent />} />

          {/* Routes for crates and shop pages if they are separate routes */}
          <Route path="/crates" element={<CratesPage />} />
          <Route path="/shop" element={<ShopPage />} />

          {/* Add a catch-all or redirect for unknown paths if needed */}
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
        
      </div>
      <Navbar
        activeIcon={getActiveIcon()}
        onIconPress={handleIconPress}
      />
    </div>
  );
}


// --- Styles Definition (same as before) ---
const styles: { [key: string]: CSSProperties } = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: Colors.background || '#f0f0f0',
  },
  contentArea: {
    flex: 1, // takes all remaining space
    display: 'flex',
    flexDirection: 'column',
  },
  homePageLayout: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: 5,
  },
  topSection: {
    marginBottom: 10,
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
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
  },
  horizontalButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 0,
    marginTop: 0,
    alignItems: 'center',
  },
};