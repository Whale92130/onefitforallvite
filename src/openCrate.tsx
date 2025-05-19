import { CSSProperties, useState, useEffect } from 'react'; // Added useState, useEffect
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

// Firebase Imports (add these)
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore"; // Added onSnapshot for real-time updates

// --- OpenShopScreen Component ---
export default function OpenShopScreen() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State for crate count and loading
  const [crateCount, setCrateCount] = useState<number>(0); // Default to 0
  const [isLoading, setIsLoading] = useState(true);

  // Firebase instances
  const auth = getAuth();
  const db = getFirestore();

  // Effect to fetch and listen for crate count updates
  useEffect(() => {
    const currentUser = auth.currentUser;
    let unsubscribe: (() => void) | null = null; // For onSnapshot cleanup

    if (currentUser) {
      setIsLoading(true);
      const userRef = doc(db, "users", currentUser.uid);

      // Use onSnapshot for real-time updates if the count changes elsewhere
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.crateCount === 'number') {
            setCrateCount(data.crateCount);
          } else {
            // If crateCount doesn't exist on the user doc, assume 0 for shop display
            // The OpenCrateScreen handles initialization if user goes there first
            setCrateCount(0);
          }
        } else {
          // User document might not exist yet if they haven't visited OpenCrateScreen
          console.log("User document does not exist yet for crate count.");
          setCrateCount(0); // Assume 0 if no user doc
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error listening to crate count:", error);
        setCrateCount(0); // Fallback on error
        setIsLoading(false);
      });

    } else {
      // No user logged in
      setCrateCount(0);
      setIsLoading(false);
    }

    // Cleanup listener on component unmount or if currentUser changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth, db, auth.currentUser]); // Re-run if auth, db, or currentUser object itself changes

  // --- Styles Definition ---
  const styles: { [key: string]: CSSProperties } = {
    container: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      backgroundColor: theme.background || '#f4f4f4',
    },
    button: {
      width: '90%',
      height: 170,
      borderRadius: 20,
      backgroundColor: theme.primary || '#e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      padding: 10,
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      textAlign: 'center',
      WebkitTapHighlightColor: 'transparent',
    },
    imageContainer: {
      position: 'relative',
      display: 'inline-block',
      marginBottom: 10,
    },
    image: {
      width: 100,
      height: 100,
      objectFit: 'contain',
      display: 'block',
    },
    badge: {
      position: 'absolute',
      top: 5,
      right: 0,
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      width: 22,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 'bold',
      zIndex: 1,
    },
    text: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary || '#333333',
    },
  };

  const handleOpenShop = () => {
    navigate('/crates');
  };

  // Use the fetched crateCount for the badge
  const badgeCountToDisplay = isLoading ? '...' : crateCount;

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={handleOpenShop} type="button">
        <div style={styles.imageContainer}>
          <img
            src={"/images/crate.png"}
            alt="Crate"
            style={styles.image}
          />
          {/* Conditionally render badge if count > 0 and not loading */}
          {!isLoading && (
            <div style={styles.badge}>
              {badgeCountToDisplay}
            </div>
          )}
           {/* Optionally, show a loading indicator in the badge position */}
           {isLoading && (
             <div style={{...styles.badge, backgroundColor: 'grey'}}>...</div>
           )}
        </div>
        <span style={styles.text}>Open Crate</span>
      </button>
    </div>
  );
}