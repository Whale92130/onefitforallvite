import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './OpenCrateScreen.module.css'; // Import CSS Module

// Define colors locally or import from a shared module
const Colors = {
  primary: '#f0f0f0', // Example primary background color
  // Add other colors if needed
};

interface CrateResult {
  theme: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

const OpenCrateScreen: React.FC = () => {
  const [lootCrateResult, setLootCrateResult] = useState<CrateResult | null>(null);
  const navigate = useNavigate(); // Use useNavigate hook
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultToDisplay, setResultToDisplay] = useState<CrateResult | null>(null); // Store result temporarily

  // This useEffect is no longer needed for the animation itself,
  // but can be used for cleanup or other side effects if required.
  // We'll handle animation end with the onAnimationEnd event.

  const handleOpenCrate = (): CrateResult => {
    // Clear previous result visually immediately
    setLootCrateResult(null);
    setResultToDisplay(null); // Clear temp result
    setIsAnimating(true); // Start animation

    let crateResult: CrateResult;
    const roll = Math.random();

    // --- (Keep the original crate logic unchanged) ---
    if (roll <= 0.60) { // 60% chance for Common
      const commonRoll = Math.random();
      const themes = ['Greyscale Theme', 'Dark Theme'];
      const selectedTheme = themes[Math.floor(commonRoll * themes.length)];
      crateResult = { theme: selectedTheme, rarity: 'Common' };
    } else if (roll > 0.60 && roll <= 0.90) { // 30% chance for Rare
      const rareRoll = Math.random();
      if (rareRoll < 0.25) crateResult = { theme: 'Winter Theme', rarity: 'Rare' };
      else if (rareRoll < 0.5) crateResult = { theme: 'Summer Theme', rarity: 'Rare' };
      else if (rareRoll < 0.75) crateResult = { theme: 'Autumn Theme', rarity: 'Rare' };
      else crateResult = { theme: 'Spring Theme', rarity: 'Rare' };
    } else if (roll > 0.90 && roll < 0.98) { // 8% chance for Epic
      const epicRoll = Math.random();
      const themes = ['Mr. Hare Theme', 'CCA Theme', 'The Nether Theme'];
      const selectedTheme = themes[Math.floor(epicRoll * themes.length)];
      crateResult = { theme: selectedTheme, rarity: 'Epic' };
    } else { // 2% chance for Legendary
      const legendaryRoll = Math.random();
      const themes = ['Midnight Theme', 'America Theme', 'Ender Pearl Theme'];
      const selectedTheme = themes[Math.floor(legendaryRoll * themes.length)];
      crateResult = { theme: selectedTheme, rarity: 'Legendary' };
    }
    // --- (End of original crate logic) ---

    // Store the result to be displayed after animation
    setResultToDisplay(crateResult);
    return crateResult; // Return it although it's now primarily handled by state
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false); // Stop animation class
    if (resultToDisplay) {
      setLootCrateResult(resultToDisplay); // Show the result
    }
  };

  // --- (Keep utility functions getRarityColor, getThemeBackgroundColor unchanged) ---
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'Common': return 'green';
      case 'Rare': return 'blue';
      case 'Epic': return 'purple';
      case 'Legendary': return 'orange';
      default: return 'gray';
    }
  };

  const getThemeBackgroundColor = (theme: string): string => {
    switch (theme) {
      case 'Greyscale Theme': return '#d4d4d4';
      case 'Dark Theme': return '#292929';
      case 'Ocean Theme': return '#1f28a3';
      case 'Winter Theme': return '#90c0e8';
      case 'Summer Theme': return '#ffe51f';
      case 'Autumn Theme': return '#c93c00';
      case 'Spring Theme': return '#80d162';
      case 'Mr. Hare Theme': return '#ffff00';
      case 'CCA Theme': return '#b52400';
      case 'The Nether Theme': return '#ff6200';
      case 'Midnight Theme': return '#000000';
      case 'America Theme': return '#ff0022';
      case 'Ender Pearl Theme': return '#1b0042';
      default: return 'transparent';
    }
  };
  // --- (End of utility functions) ---

  return (
    <div className={styles.container} style={{ backgroundColor: Colors.primary }}>
      <div className={styles.contentContainer}>
        {/* Show result only if not animating AND result exists */}
        {!isAnimating && lootCrateResult ? (
          <>
            <p className={styles.themeText}>You got: {lootCrateResult.theme}</p>
            <div
              className={styles.square}
              style={{ backgroundColor: getThemeBackgroundColor(lootCrateResult.theme) }}
            />
            <p style={{ color: getRarityColor(lootCrateResult.rarity) }} className={styles.rarityText}>
              {lootCrateResult.rarity}
            </p>
          </>
        ) : (
          // Placeholder or empty space while animating or before first open
          <div className={styles.placeholder}></div>
        )}
      </div>

      {/* Animated Crate Image */}
      {isAnimating && (
        <img
          src={"/crate.png"}
          alt="Crate opening"
          className={`${styles.crateImage} ${styles.crateAnimating}`} // Apply base and animation styles
          onAnimationEnd={handleAnimationEnd} // Detect when CSS animation finishes
        />
      )}

      {/* Buttons shown only after a result is displayed */}
      {!isAnimating && lootCrateResult && (
        <div className={styles.buttonContainer}>
          <button className={`${styles.button} ${styles.claimButton}`} onClick={() => console.log('Claim pressed')}>
            Claim
          </button>
          <button
            className={`${styles.button} ${styles.claimAndEquipButton}`}
            onClick={() => navigate('/')} // Use navigate for web routing
          >
            Claim and Equip
          </button>
        </div>
      )}

      {/* Open Crate / Open Another Button */}
      {/* Only show button when not animating */}
      {!isAnimating && (
        <div className={styles.openAnotherButtonContainer}>
           <button className={styles.openButton} onClick={handleOpenCrate}>
             {lootCrateResult ? 'Open Another' : 'Open Crate'}
           </button>
        </div>
      )}
    </div>
  );
};

export default OpenCrateScreen;