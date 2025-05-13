import  { CSSProperties } from 'react'; // Import CSSProperties for type checking styles

// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors.primary etc. with actual color values.
// Make sure the path is correct relative to this file.
import { Colors } from './colors'; // Adjust the path as needed

// Mock data for the next workout (Consider defining an interface if more complex)
const nextWorkout = {
  title: 'Your Next Workout',
  exercises: ['Squats', 'Push-ups', 'Lunges', 'Plank'],
};

// Define styles as JS objects. Use CSSProperties for type safety.
const styles: { [key: string]: CSSProperties } = {
  container: {
    height: '100%',
    display: 'flex', // Needed for flex properties below
    flexDirection: 'column',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex', // Use flex for alignment
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0, // Prevent header from shrinking if container space is limited
  },
  title: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 10, // Added a bit more padding
  },
  buttonContainer: {
    flex: 1, // Allows this container to grow and take available vertical space
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around', // Distributes buttons vertically
    width: '100%',
    marginTop: 10, // Add some space between title and buttons
  },
  button: {
    // Use flex properties to center content *within* the button
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.button,
    borderRadius: 5,
    marginBottom: 8, // Use margin for spacing between buttons
    padding: '12px 10px', // Add some padding for better button appearance
    border: 'none', // Remove default button border
    cursor: 'pointer', // Indicate interactivity
    textAlign: 'center', // Ensure text is centered if flex alignment fails unexpectedly
    flexGrow: 1, // Allow buttons to grow slightly if space allows (adjust if needed)
    flexBasis: 'auto', // Let content determine initial size
    // Note: The visual feedback of TouchableOpacity (opacity change) is not replicated here.
    // You could add :hover/:active styles using state or a CSS-in-JS library if needed.
  },
  // Style for the text *inside* the button
  buttonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500', // Slightly bolder text for buttons
  },
};


function YourNextWorkout() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {/* Use h2 or similar heading tag */}
        <h2 style={styles.title}>{nextWorkout.title}</h2>
      </div>

      {/* Container for the buttons */}
      <div style={styles.buttonContainer}>
        {nextWorkout.exercises.map((exercise, index) => (
          // Use standard HTML button element for interactivity
          <button key={index} style={styles.button} type="button">
            {/* Use a span for the text styling within the button */}
            <span style={styles.buttonText}>{exercise}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default YourNextWorkout;