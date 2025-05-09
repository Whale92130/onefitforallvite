import React, { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

// --- Asset Import ---
// Use standard ES module import for assets in Vite.
// Adjust the path based on your actual project structure.
import crateImageSrc from '/home/user/onefitforallvite/src/assets/images/crate.png';

// --- Colors Import ---
// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors properties with actual color values.
import { Colors } from './colors'; // Adjust path as needed

// --- Styles Definition ---
const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flex: 1, // For flex:1 to work, parent often needs display:flex and a defined height or flex-basis
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    backgroundColor: Colors.background || '#f4f4f4', // Add a background for context
  },
  button: {
    width: '90%', // Slightly larger for web
    height: 170,
    borderRadius: 20,
    backgroundColor: Colors.primary || '#e0e0e0', // Provide fallback
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
    // For active/hover states, you'd typically use CSS Modules or a CSS-in-JS library
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10, // Increased margin
    objectFit: 'contain', // Ensure image scales nicely
    display: 'block',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary || '#333333', // Provide fallback
  },
};

// --- OpenCrateScreen Component ---
export default function OpenCrateScreen() {
  // Use the useNavigate hook from react-router-dom
  const navigate = useNavigate();

  const handleOpenCrates = () => {
    // Navigate to the 'crates' route.
    // This route needs to be defined in your <Routes> configuration.
    navigate('/crates'); // Or whatever your defined path is for the crates page
  };

  return (
    // Main container div
    <div style={styles.container}>
      {/* Use a <button> element for interactivity */}
      <button style={styles.button} onClick={handleOpenCrates} type="button">
        {/* Use <img> for the image */}
        <img
          src={crateImageSrc} // Use imported image variable
          alt="Crate" // Add descriptive alt text
          style={styles.image}
        />
        {/* Use a <span> for the text */}
        <span style={styles.text}>Open crates</span>
      </button>
    </div>
  );
}

// Define placeholder Colors if not imported - REPLACE WITH YOUR ACTUAL COLORS
// interface ColorPalette { [key: string]: string }
// const Colors: ColorPalette = {
//   background: '#f4f4f4',
//   primary: '#A9A9A9', // Example primary color
//   textPrimary: '#333333',
// };