import React, { CSSProperties } from 'react';
import { useTheme } from './ThemeContext';
import { ThemeName } from './colors';
import { getAuth } from 'firebase/auth';
import defaultAvatar from "/home/user/onefitforallvite/src/assets/navbar_icons/default_avatar.png"; // Make sure this path is correct

// --- Type Definitions ---
export type IconName = 'home' | 'newWorkout' | 'profile';

type IconConfig = {
  name: IconName;
  source: string;
};

export type NavbarProps = {
  activeIcon: IconName;
  onIconPress: (icon: IconName) => void;
};

// --- Navbar Component ---
const Navbar: React.FC<NavbarProps> = ({ activeIcon, onIconPress }) => {
  const { theme, themeName } = useTheme();

  // --- Icon Data (MOVED INSIDE) ---
  // This needs to be inside the component to react to auth state changes
  const auth = getAuth();
  const user = auth.currentUser;
  const profilePicSrc = user?.photoURL ?? defaultAvatar;

  const ICONS: IconConfig[] = [
    { name: "home", source: "/navbar_icons/home_icon.png" },
    { name: "newWorkout", source: "/navbar_icons/start_icon.png" },
    { name: "profile", source: profilePicSrc },
  ];
  // --- End Icon Data ---


  const darkTint = 'grayscale(100%) brightness(40%) contrast(100%)';
  const lightTint = 'invert(100%) brightness(2000%) contrast(90%)';
  let activeTint: string;
  let navbarProfileBorderColor: string;

  // --- Active Tint Logic (simplified for brevity, keep your full logic) ---
  if (themeName === 'light') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
    navbarProfileBorderColor = '#109ce6';
  } else if (themeName === 'dark') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
    navbarProfileBorderColor = '#109ce6';
  } else if (themeName === 'goodBoy') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
    navbarProfileBorderColor = '#109ce6';
  } else if (themeName === 'CCA') {
    activeTint = 'invert(26%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(105%) contrast(105%)';
    navbarProfileBorderColor = '#ec1600';
  } else if (themeName === 'spring') {
    activeTint = 'invert(50%) sepia(80%) saturate(8000%) hue-rotate(-65deg) brightness(100%) contrast(120%)';
    navbarProfileBorderColor = '#fb10d6';
  } else if (themeName === 'summer') {
    activeTint = 'invert(45%) sepia(60%) saturate(5000%) hue-rotate(170deg) brightness(155%) contrast(90%)';
    navbarProfileBorderColor = '#1be9f5';
  } else if (themeName === 'winter') {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
    navbarProfileBorderColor = '#109ce6';
  } else if (themeName === 'autumn') {
    activeTint = 'invert(20%) sepia(95%) saturate(2000%) hue-rotate(-5deg) brightness(85%) contrast(90%)';
    navbarProfileBorderColor = '#9c3721';
  } else if (themeName === 'mrhare') {
    activeTint = 'invert(96%) sepia(15%) saturate(5000%) hue-rotate(5deg) brightness(200%) contrast(70%)';
    navbarProfileBorderColor = '#dad82a';
  } else if (themeName === 'nether') {
    activeTint = 'invert(26%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(105%) contrast(105%)';
    navbarProfileBorderColor = '#ec1600';
  } else if (themeName === 'midnight') {
    activeTint = 'invert(45%) sepia(60%) saturate(2500%) hue-rotate(170deg) brightness(25%) contrast(50%)';
    navbarProfileBorderColor = '#3f525a';
  } else if (themeName === 'america') {
    activeTint = 'invert(26%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(105%) contrast(165%)';
    navbarProfileBorderColor = '#ec1600';
  } else if (themeName === 'enderpearl') {
    activeTint = 'invert(15%) sepia(60%) saturate(8000%) hue-rotate(270deg) brightness(90%) contrast(105%)';
    navbarProfileBorderColor = '#6b0bd1';
  } else {
    activeTint = 'invert(45%) sepia(60%) saturate(1500%) hue-rotate(170deg) brightness(95%) contrast(90%)';
    navbarProfileBorderColor = '#109ce6'; // Default
  }


  const iconFilterByTheme: Record<ThemeName, string> = {
    light: darkTint,
    dark: lightTint,
    goodBoy: lightTint,
    CCA: lightTint,
    spring: darkTint,
    summer: darkTint,
    winter: darkTint,
    autumn: lightTint,
    mrhare: darkTint,
    nether: lightTint,
    midnight: lightTint,
    america: darkTint,
    enderpearl: lightTint,
  };
  const iconFilter = iconFilterByTheme[themeName] || darkTint;

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
    iconImage: { // Base style for ALL icons
      width: 28,
      height: 28,
      display: 'block',
      objectFit: 'contain', // Default objectFit
    },
    profileIcon: { // Specific styles for profile icon (both active and inactive)
      width: 32, // Slightly larger
      height: 32,
      borderRadius: '50%',
      border: `1px solid ${theme.textPrimary}`, // Default border for inactive profile
      objectFit: 'cover', // Important for profile pics
    },
    activeProfileBorderStyle: { // NEW: Style for the ACTIVE profile icon's BORDER
      border: `3px solid ${theme.button || theme.primary}`, // Use theme.button or theme.primary for active border
      borderColor: navbarProfileBorderColor,
      // You could add a subtle box-shadow too if you like:
      // boxShadow: `0 0 5px ${theme.button || theme.primary}`,
    },
    activeIconStyle: { // For NON-PROFILE active icons (applies filter)
      filter: activeTint,
      opacity: 1,
    },
    inactiveIconStyle: { // For NON-PROFILE inactive icons (applies filter)
      filter: iconFilter,
      // opacity: 0.7, // Optional: make inactive icons slightly transparent
    },
  };

  return (
    <nav style={styles.navbar}>
      {ICONS.map((icon) => {
        const isActive = activeIcon === icon.name;
        const isProfile = icon.name === 'profile';

        let iconSpecificStyles: CSSProperties = {};

        if (isProfile) {
          iconSpecificStyles = { ...styles.profileIcon }; // Base profile styles
          if (isActive) {
            iconSpecificStyles = { ...iconSpecificStyles, ...styles.activeProfileBorderStyle };
          }
        } else {
          // For non-profile icons (home, newWorkout)
          if (isActive) {
            iconSpecificStyles = { ...styles.activeIconStyle };
          } else {
            iconSpecificStyles = { ...styles.inactiveIconStyle };
          }
        }

        return (
          <button
            key={icon.name}
            style={styles.iconContainer}
            onClick={() => onIconPress(icon.name)}
            type="button"
            aria-label={`Navigate to ${icon.name}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <img
              src={icon.source}
              alt={`${icon.name} icon`}
              style={{
                ...styles.iconImage,     // Base image styles for all
                ...iconSpecificStyles,    // Apply calculated specific styles
              }}
            />
          </button>
        );
      })}
    </nav>
  );
};

export default Navbar;