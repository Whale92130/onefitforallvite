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
  const darkTint  = 'grayscale(100%) brightness(40%) contrast(100%)';      // for “dark” (black‐ish) text
  const lightTint = 'invert(100%) brightness(2000%) contrast(90%)';      // for “light” (white‐ish) text
  let activeTint: string;
  
  if (themeName === 'light') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
  } else if (themeName === 'dark') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
  }else if (themeName === 'goodBoy') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
  }else if (themeName === 'CCA') {
    activeTint = 'invert(26%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(105%) contrast(105%)';
  }else if (themeName === 'spring') {
    activeTint = 'invert(50%) sepia(80%) saturate(8000%) hue-rotate(-65deg) brightness(100%) contrast(120%)';
  }else if (themeName === 'summer') {
    activeTint = 'invert(45%) sepia(60%) saturate(5000%) hue-rotate(170deg) brightness(155%) contrast(90%)';
  }else if (themeName === 'winter') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
  }else if (themeName === 'autumn') {
    activeTint = 'invert(20%) sepia(95%) saturate(2000%) hue-rotate(-5deg) brightness(85%) contrast(90%)';
  }else if (themeName === 'mrhare') {
    activeTint = 'invert(96%) sepia(15%) saturate(5000%) hue-rotate(5deg) brightness(200%) contrast(70%)';
  }else if (themeName === 'nether') {
    activeTint = 'invert(26%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(105%) contrast(105%)';
  }else if (themeName === 'midnight') {
    activeTint = 'invert(45%) sepia(60%) saturate(2500%) hue-rotate(170deg) brightness(25%) contrast(50%)';
  }else if (themeName === 'america') {
    activeTint = 'invert(26%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(105%) contrast(165%)';
  }else if (themeName === 'enderpearl') {
    activeTint = 'invert(15%) sepia(60%) saturate(8000%) hue-rotate(270deg) brightness(90%) contrast(105%)';
  } else {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
  }
  // 2) Explicit map of *every* themeName → the filter you want:
  const iconFilterByTheme: Record<ThemeName, string> = {
    light:   darkTint,
    dark:    lightTint,
    goodBoy: lightTint,  // white textPrimary  
    CCA:     lightTint,  // white textPrimary
    spring:  darkTint,   // black textPrimary
    summer:  darkTint,   // black textPrimary
    winter:  darkTint,   // black textPrimary
    autumn:  lightTint,  // white textPrimary
    mrhare:  darkTint,   // black textPrimary
    nether:  lightTint,  // white textPrimary
    midnight:lightTint,  // white textPrimary
    america: darkTint,   // black textPrimary
    enderpearl: lightTint,
  };
  const iconFilter = iconFilterByTheme[themeName] || darkTint;
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
      filter: activeTint,


      opacity: 1,
    },
    // Conditionally set the inactive icon style
    inactiveIconStyle: {
      filter: iconFilter,
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