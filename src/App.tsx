import  { CSSProperties, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate} from 'react-router-dom';

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
import Stopwatch from './stopwatch';
import SignInPage from './signInPage';
// Placeholder for NewWorkout page component
const NewWorkoutPage = () => <div style={{padding: 20, textAlign: 'center'}}><h2>We're staying strong!</h2>
    {/* Render the NewWorkout component here */}
    <Stopwatch/>
    <NewWorkout />  </div>;
const CratesPage = () => <div style={{padding: 20, textAlign: 'center'}}>
  
  <OpenCrateScreen/> 
</div>;
const ShopPage = () => <div style={{padding: 20, textAlign: 'center'}}><h2>Shop Page</h2><p>Shop content.</p></div>;

// --- Colors Import (adjust path as needed) ---
import { Colors } from './colors';
import { FirebaseProvider } from './FirebaseContext';
import { User, getAuth } from 'firebase/auth';
import NavigateToCrateButton from './openCrate';




// Component to render for the Home page
const HomeContent = () => (
  <FirebaseProvider>
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
          <Leaderboard/>
        </div>
      </div>
    </div>
  </FirebaseProvider>
);

// Component to render for the Profile page
const ProfileContent = () => {
  const navigate = useNavigate();
  return (
  <div style={styles.profilePageLayout}>
    <ProfileScreen />
    <div style={styles.horizontalButtons}>
      <NavigateToCrateButton />
      <OpenShop/>
    </div>
  </div>
)};


// --- App Component (Manages routing) ---
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
const [user, setUser] = useState<User | null>(null);
const [initializing, setInitializing] = useState(true);



const onAuthStateChanged = (user: User | null) => {
  console.log("onAuthStateChanged", user);
  setUser(user);
  navigate("/sign-in")
  if (initializing) setInitializing(false);
};

useEffect(() => {
  const subscriber = getAuth().onAuthStateChanged(onAuthStateChanged);
  return subscriber;
}, []);

useEffect(() => {
  if (initializing) return;
  const segments = location.pathname.split("/");
  const inAuthGroup = !segments.includes("sign-in");

  console.log(inAuthGroup)

  if (user && !inAuthGroup) {
    navigate("/");
  } else if (!user && inAuthGroup) {
    navigate("/sign-in");
  }
}, [user,location.pathname]);


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

          <Route path="/sign-in" element={<SignInPage />} />

          {/* Add a catch-all or redirect for unknown paths if needed */}
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
        
      </div>

      {user!==null&&<Navbar
        activeIcon={getActiveIcon()}
        onIconPress={handleIconPress}
      />}
    </div>
  );
}


// --- Styles Definition (same as before) ---
const styles: { [key: string]: CSSProperties } = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '40%',
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
    height: '60%',
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

//npm install react-router-dom