import React, { CSSProperties } from 'react';
import { useTheme } from './ThemeContext'; // Correct: Import useTheme
import { ThemeName } from './colors'; // Import ThemeName if you need it for type checking

// --- Type Definitions ---
export type IconName = 'home' | 'newWorkout' | 'profile';

// Interface for icon configuration
type IconConfig = {
  name: IconName;
  source: string;
};

// Props for the Navbar component
export type NavbarProps = {
  activeIcon: IconName;
  onIconPress: (icon: IconName) => void;
};

// --- Icon Data ---
const ICONS: IconConfig[] = [
  {
    name: 'home',
    source: "/navbar_icons/home_icon.png",
  },
  {
    name: 'newWorkout',
    source: "/navbar_icons/start_icon.png",
  },
  {
    name: 'profile',
    source: "/icons/logo.jpeg",
  },
];

// --- Navbar Component ---
const Navbar: React.FC<NavbarProps> = ({ activeIcon, onIconPress }) => {
  // 1. Call useTheme() INSIDE the component
  // Destructure themeName as well to check which theme is active
  const { theme, themeName } = useTheme();

  // 2. Define styles INSIDE the component or make it a function
  const styles: { [key: string]: CSSProperties } = {
    navbar: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.background,
      height: "60px",
      paddingLeft: 10,
      paddingRight: 10,
      width: '100%',
      boxSizing: 'border-box',
      flexShrink: 0,
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 1000,
      borderTop: `1px solid ${theme.secondary}`,
    },
    iconContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    iconImage: {
      width: 28,
      height: 28,
      display: 'block',
      objectFit: 'contain',
    },
    profileIcon: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: `1px solid ${theme.textPrimary}`,
      objectFit: 'cover',
     
    },
    activeIconStyle: {
      // Your existing active style, or adjust as needed
      // This filter is a blueish tint, you might want to tie it to theme.primary or theme.button
      filter: `invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)`,
      opacity: 1,
    },
    // Conditionally set the inactive icon style
    inactiveIconStyle: {
      filter: themeName === 'light'
        ? 'grayscale(100%) brightness(40%) contrast(100%)' // Tint dark on light theme
        : 'invert(100%) brightness(2000%) contrast(90%)', // Tint light on dark theme
      // Explanation of filter values:
      // grayscale(100%): Makes the icon monochrome.
      // brightness(40%): Makes it darker (values < 100%). For light theme.
      // brightness(150%): Makes it lighter (values > 100%). For dark theme.
      // contrast(100%): Keeps normal contrast, adjust if needed.
    },
  };

  return (
    <nav style={styles.navbar}>
      {ICONS.map((icon) => (
        <button
          key={icon.name}
          style={styles.iconContainer}
          onClick={() => onIconPress(icon.name)}
          type="button"
          aria-label={`Navigate to ${icon.name}`}
          aria-current={activeIcon === icon.name ? 'page' : undefined}
        >
          <img
            src={icon.source}
            alt={`${icon.name} icon`}
            style={{
              ...styles.iconImage,
              ...(icon.name === 'profile' ? styles.profileIcon : {}),
              ...(activeIcon === icon.name
                ? styles.activeIconStyle
                : styles.inactiveIconStyle), // This will now apply the conditional style
            }}
          />
        </button>
      ))}
    </nav>
  );
};

export default Navbar;