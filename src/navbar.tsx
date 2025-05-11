import React, { CSSProperties } from 'react';

// --- Asset Imports ---
// Use standard ES module imports for assets in Vite.
// Adjust these paths based on your actual project structure.
import homeIconSrc from '/home/user/onefitforallvite/src/assets/navbar_icons/home_icon.png';
import newWorkoutIconSrc from '/home/user/onefitforallvite/src/assets/navbar_icons/start_icon.png';
import profileIconSrc from '/home/user/onefitforallvite/src/assets/icons/logo.jpeg'; // Assuming this is the correct profile icon

// --- Colors Import ---
// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors properties with actual color values.
import { Colors } from './colors'; // Adjust path as needed

// --- Type Definitions ---
export type IconName = 'home' | 'newWorkout' | 'profile';

// Interface for icon configuration, using string for image source paths
type IconConfig = {
  name: IconName;
  source: string; // Changed from ImageSourcePropType to string for import path
};

// Props for the Navbar component
export type NavbarProps = {
  activeIcon: IconName;
  onIconPress: (icon: IconName) => void;
};

// --- Icon Data ---
// Define the icons using the imported image sources
const ICONS: IconConfig[] = [
  {
    name: 'home',
    source: homeIconSrc,
  },
  {
    name: 'newWorkout',
    source: newWorkoutIconSrc,
  },
  {
    name: 'profile',
    source: profileIconSrc,
  },
];

// --- Styles Definition ---
const styles: { [key: string]: CSSProperties } = {
  navbar: {
    display: 'flex', // Use flexbox for layout
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.background || '#ffffff', // Provide fallback
    height: 42,
    paddingLeft: 10, // Use standard padding properties
    paddingRight: 10,
    width: '100%', // Ensure navbar spans width
    boxSizing: 'border-box', // Include padding/border in width
    flexShrink: 0,
  },
  // Style for the button container
  iconContainer: {
    flex: 1, // Allow each container to take equal space
    display: 'flex', // Use flex to center content
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%', // Make container fill navbar height
    // Reset button default styles
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  // Base style for all icons
  iconImage: {
    width: 28,
    height: 28,
    display: 'block', // Remove potential extra space below image
    objectFit: 'contain', // Or 'cover', depending on desired image scaling
    filter: 'grayscale(100%) brightness(0%)',
  },
  // Specific overrides for the profile icon
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%', // Use 50% for circle
    border: `1px solid ${Colors.textPrimary || '#333333'}`, // Use border shorthand, add fallback
    objectFit: 'cover', // Usually better for profile pictures
  },
  // Style for active state (using opacity instead of tintColor)
  activeIconStyle: {
    opacity: 1,
    filter: 'invert(45%) sepia(30%) saturate(2000%) hue-rotate(180deg) brightness(105%) contrast(90%)',
  },
  // Style for inactive state (using opacity instead of tintColor)
  inactiveIconStyle: {
    opacity: 0.6,
    filter: 'grayscale(100%) brightness(0%)',
  },
};


// --- Navbar Component ---
const Navbar: React.FC<NavbarProps> = ({ activeIcon, onIconPress }) => (
  // Use <nav> for semantic correctness
  <nav style={styles.navbar}>
    {ICONS.map((icon) => (
      // Use <button> for interactive elements
      <button
        key={icon.name}
        style={styles.iconContainer}
        onClick={() => onIconPress(icon.name)} // Use onClick for web
        type="button" // Specify button type
        aria-label={`Navigate to ${icon.name}`} // Add accessibility label
      >
        {/* Use <img> for images */}
        <img
          src={icon.source} // Use src attribute with imported image path
          alt={`${icon.name} icon`} // Add descriptive alt text
          style={{
            ...styles.iconImage, // Apply base icon style
            ...(icon.name === 'profile' ? styles.profileIcon : {}), // Apply profile specific style if needed
            ...(activeIcon === icon.name // Apply active/inactive style based on opacity
              ? styles.activeIconStyle
              : styles.inactiveIconStyle),
            // Note: The 'tintColor' effect from activeIcon/inactiveIcon styles
            // cannot be directly replicated on <img> tags using CSS.
            // We are using opacity here as an alternative visual cue.
          }}
        />
      </button>
    ))}
  </nav>
);

export default Navbar;
