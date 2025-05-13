import  { CSSProperties } from 'react'; // Import CSSProperties for type checking styles

// --- Asset Imports ---
// Use standard ES module imports for assets in Vite.
// Adjust these paths based on your actual project structure.
import logoImage from '/home/user/onefitforallvite/src/assets/icons/logo.jpeg';
import fireImage from '/home/user/onefitforallvite/src/assets/images/fire.png';

// --- Colors Import ---
// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors properties with actual color values.
import { Colors } from './colors'; // Adjust path as needed
import useFirebase from './useFirebase';
import { getAuth } from 'firebase/auth';

// --- Styles Definition ---
const styles: { [key: string]: CSSProperties } = {
  // Replaces SafeAreaView - mainly for background color and potential top padding
  topBarWrapper: {
    backgroundColor: Colors.background || '#ffffff', // Provide fallback color
    // Add padding top if you need to manually simulate safe area space
    // paddingTop: 'env(safe-area-inset-top)', // This uses CSS env variables, support varies
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
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
    backgroundColor: Colors.primary || '#f0f0f0', // Provide fallback color
    padding: 8,
    borderRadius: 15,
  },
  // Specific style for the fire icon image
  fireIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    display: 'block',
    // tintColor: Colors.textPrimary, // OMITTED: tintColor has no direct CSS equivalent for <img>
                                     // Consider using SVG or CSS filters as workarounds if needed.
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary || '#333333', // Provide fallback color
    lineHeight: '1', // Adjust line height to prevent extra vertical space
  },
};

// --- TopBar Component ---
const TopBar = () => {

  const user = getAuth().currentUser;
  const streakCount = 10; // Replace with actual user streak count logic

  return (
    // Wrapper div replacing SafeAreaView
    <div style={styles.topBarWrapper}>
      {/* Main container div */}
      <div style={styles.container}>
        {/* Logo Image */}
        <img
          src={logoImage} // Use imported image variable
          alt="App Logo" // Add descriptive alt text
          style={styles.logo}
        />
        <h1>Hello {user?.displayName??user?.email??"User"}</h1>

        {/* Streak Counter Container */}
        <div style={styles.streakContainer}>
          {/* Fire Icon Image */}
          <img
            src={fireImage} // Use imported image variable
            alt="Streak icon" // Add descriptive alt text
            style={styles.fireIcon}
            // Note: tintColor effect is missing
          />
          {/* Streak Count Text (using span for inline text) */}
          <span style={styles.streakText}>{streakCount}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;