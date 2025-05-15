import { CSSProperties } from 'react'; // Import CSSProperties for type checking styles

// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors.primary and Colors.textPrimary with actual color values
// Make sure the path is correct relative to this file.
//import { Colors } from './colors'; // Adjust the path as needed
import { useTheme } from './ThemeContext';
// Define an interface for the workout data structure
interface Workout {
  id: string;
  name: string;
  image: string;
}

// Define the workout data with the correct type
const workoutData: Workout[] = [
    { id: '1', name: 'Workout A', image: 'https://placehold.co/200x150/808080/FFFFFF?text=Workout+A' },
    { id: '2', name: 'Workout B', image: 'https://placehold.co/200x150/A9A9A9/FFFFFF?text=Workout+B' },
    { id: '3', name: 'Workout C', image: 'https://placehold.co/200x150/C0C0C0/FFFFFF?text=Workout+C' },
    { id: '4', name: 'Workout D', image: 'https://placehold.co/200x150/D3D3D3/FFFFFF?text=Workout+D' },
    { id: '5', name: 'Workout E', image: 'https://placehold.co/200x150/808080/FFFFFF?text=Workout+E' },
    { id: '6', name: 'Workout F', image: 'https://placehold.co/200x150/A9A9A9/FFFFFF?text=Workout+F' },
    { id: '7', name: 'Workout G', image: 'https://placehold.co/200x150/C0C0C0/FFFFFF?text=Workout+G' },
    { id: '8', name: 'Workout H', image: 'https://placehold.co/200x150/D3D3D3/FFFFFF?text=Workout+H' },
    { id: '9', name: 'Workout I', image: 'https://placehold.co/200x150/808080/FFFFFF?text=Workout+I' },
    { id: '10', name: 'Workout J', image: 'https://placehold.co/200x150/A9A9A9/FFFFFF?text=Workout+J' },
    { id: '11', name: 'Workout K', image: 'https://placehold.co/200x150/C0C0C0/FFFFFF?text=Workout+K' },
    { id: '12', name: 'Workout L', image: 'https://placehold.co/200x150/D3D3D3/FFFFFF?text=Workout+L' },
];

// Define styles as JS objects. Use CSSProperties for type safety.
// React Native style properties (camelCase) map directly to React inline style properties.



function RecommendedWorkouts() {
  const {theme} = useTheme();
  const styles: { [key: string]: CSSProperties } = {
    container: {
      width: "100%",
      height: "100%", // Be cautious with 100% height in web context, might need specific parent height
      display: 'flex',
      flexDirection: 'column', // Stays camelCase
      alignItems: 'center', // Stays camelCase
      backgroundColor: theme.primary, // Use imported color value
      borderRadius: 10, // Use numbers (pixels) or string ('10px')
      padding: 10,
      boxSizing: 'border-box', // Recommended for predictable sizing with padding/borders
    },
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 5, // Adjusted slightly for web spacing
      textAlign: 'center',
    },
    scrollContainer: {
      width: '100%',
      marginTop: 10,
      overflowX: 'auto', // Key style to replicate horizontal ScrollView
      overflowY: 'hidden', // Hide vertical scrollbar if it appears
      // Note: Advanced scrollbar styling (::-webkit-scrollbar etc.) is NOT possible with inline styles
    },
    scrollContentContainer: {
      display: 'flex', // Use flexbox to lay out items horizontally
      flexDirection: 'row', // Explicitly set row direction
      alignItems: 'flex-start',
      paddingBottom: 0, // Add some padding at the bottom, e.g., for scrollbar space
      // paddingRight: 15, // We handle spacing with marginRight on items instead
    },
    // Base style for workout items - separated for easier conditional margin logic
    workoutItemBase: {
      width: 120,
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0, // Prevent items from shrinking when space is limited
    },
    // Margin style to apply conditionally to items except the last one
    workoutItemMargin: {
      marginRight: 10,
    },
    image: {
      width: 120,
      height: 80,
      borderRadius: 8,
      objectFit: 'cover', // Ensures image covers the area well
      display: 'block', // Prevents potential extra space below the image
    },
    workoutName: {
      marginTop: 5,
      fontSize: 12,
      color: theme.textPrimary,
      textAlign: 'center', // Center the name under the image
    },
  };
  return (
    // Use standard HTML elements (div, h2, p, img) and apply styles using the `style` prop
    <div style={styles.container}>
      <h2 style={styles.heading}>Recommended Workouts</h2>

      {/* Replicate ScrollView */}
      <div style={styles.scrollContainer}>
        {/* Inner container for the scrollable content */}
        <div style={styles.scrollContentContainer}>
          {workoutData.map((workout, index) => (
            <div
              key={workout.id}
              // Combine base style with conditional margin style
              // This mimics not having margin on the last item
              style={{
                ...styles.workoutItemBase,
                ...(index < workoutData.length - 1 ? styles.workoutItemMargin : {}),
              }}
            >
              {/* Use standard img tag */}
              <img
                src={workout.image} // Map source.uri to src
                alt={workout.name} // Add alt text for accessibility
                style={styles.image}
              />
              {/* Use p or span for text */}
              <p style={styles.workoutName}>{workout.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecommendedWorkouts;