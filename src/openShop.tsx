import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

// --- Asset Import ---
// Use standard ES module import for assets in Vite.
// Adjust the path based on your actual project structure.
import shopIconSrc from '/home/user/onefitforallvite/src/assets/images/shop_icon.png';
import { useTheme } from './ThemeContext';
// --- Colors Import ---
// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors properties with actual color values.
//import { Colors } from './colors'; // Adjust path as needed


// --- OpenShopScreen Component ---
export default function OpenShopScreen() {
  const { theme } = useTheme();
  // --- Styles Definition ---
  const styles: { [key: string]: CSSProperties } = {
    container: {
      display: 'flex',
      flex: 1, // For flex:1 to work, parent often needs display:flex and a defined height or flex-basis
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      backgroundColor: theme.background || '#f4f4f4', // Add a background for context
    },
    button: {
      width: '90%', // Slightly larger for web
      height: 170,
      borderRadius: 20,
      backgroundColor: theme.primary || '#e0e0e0', // Provide fallback
      display: 'flex', // Use flex to center content
      flexDirection: 'column', // Stack image and text vertically
      alignItems: 'center',
      justifyContent: 'center',
      // Reset default button styles
      border: 'none',
      padding: 10, // Add some internal padding
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Add a subtle shadow for web
      textAlign: 'center', // Ensure text is centered
    },
    image: {
      width: 100,
      height: 100,
      marginBottom: 10, // Increased margin
      objectFit: 'contain', // Ensure image scales nicely
      display: 'block',
      // tintColor: Colors.textPrimary, // OMITTED - tintColor has no direct CSS equivalent for <img>
      // If tinting is essential, use SVG icons or CSS filters.
    },
    text: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary || '#333333', // Provide fallback
    },
  };
  // Use the useNavigate hook from react-router-dom
  const navigate = useNavigate();

  const handleOpenShop = () => {
    // Navigate to the 'shop' route.
    // This route needs to be defined in your <Routes> configuration.
    navigate('/shop'); // Or whatever your defined path is for the shop page
  };

  return (
    // Main container div
    <div style={styles.container}>
      {/* Use a <button> element for interactivity */}
      <button style={styles.button} onClick={handleOpenShop} type="button">
        {/* Use <img> for the image */}
        <img
          src={shopIconSrc} // Use imported image variable
          alt="Shop Icon" // Add descriptive alt text
          style={styles.image}
        // Note: tintColor effect is missing
        />
        {/* Use a <span> for the text */}
        <span style={styles.text}>Open Shop</span>
      </button>
    </div>
  );
}