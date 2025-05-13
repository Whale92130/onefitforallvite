import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NavigateToCrateButton.module.css'; // Import CSS Module
import crateImage from '../assets/images/crate.png'; // Adjust path if needed

// Define placeholder colors or import from a shared config/CSS variables
const placeholderColors = {
  primary: '#e0e0e0',       // Example background color
  textPrimary: '#333333', // Example text color
};

const NavigateToCrateButton: React.FC = () => {
  const navigate = useNavigate();

  // Define the target route for the web app
  const targetRoute = '/crates'; // Or '/open-crate', match your router setup

  return (
    // Container div to center the button on the page
    <div className={styles.container}>
      {/* Use a button element for semantics and accessibility */}
      <button
        className={styles.button}
        onClick={() => navigate(targetRoute)}
        style={{ backgroundColor: placeholderColors.primary }} // Apply background color
      >
        <img
          src={crateImage}
          alt="Crate icon" // Add alt text for accessibility
          className={styles.image}
        />
        <span
          className={styles.text}
          style={{ color: placeholderColors.textPrimary }} // Apply text color
        >
          Open Crate
        </span>
      </button>
    </div>
  );
}



export default NavigateToCrateButton;