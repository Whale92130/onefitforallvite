// src/RecommendedWorkouts.tsx
import { CSSProperties, useEffect, useState, FC } from 'react';
import { useTheme } from './ThemeContext';
import {
  getFirestore,
  collectionGroup,
  query,
  getDocs,
  doc,
  getDoc,
  limit,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface ExerciseData {
  name: string;
  muscleGroups: string[];
}

interface FirestoreWorkoutDoc {
  exercises: ExerciseData[];
  name?: string;
  updatedAt?: any;
}

interface DisplayWorkoutData {
  id: string; // This is the document ID, used as workoutName for loading
  name: string; // This is the display name of the workout
  muscleGroups: string[];
  creatorDisplayName: string;
}

const RecommendedWorkouts: FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate(); // Initialize useNavigate
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<DisplayWorkoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      setError(null);
      const db = getFirestore();

      try {
        // Query the 'workouts' collection group
        const workoutsQuery = query(collectionGroup(db, 'workouts'), limit(10));
        const querySnapshot = await getDocs(workoutsQuery);

        const workoutsPromises = querySnapshot.docs.map(async (docSnap) => {
          const workoutData = docSnap.data() as FirestoreWorkoutDoc;
          const workoutDocumentId = docSnap.id; // This is the ID we'll pass as workoutName

          // Extract creatorId from path to fetch displayName
          const pathSegments = docSnap.ref.path.split('/');
          let creatorDisplayName = 'Anonymous'; // Default display name

          // Check if the path matches 'users/{userId}/workouts/{workoutId}'
          if (pathSegments.length >= 3 && pathSegments[0] === 'users' && pathSegments[2] === 'workouts') {
            const userId = pathSegments[1];
            try {
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists() && typeof userDoc.data().displayName === 'string' && userDoc.data().displayName.trim()) {
                creatorDisplayName = userDoc.data().displayName;
              } else {
                creatorDisplayName = `User ${userId.substring(0, 6)}`; // Fallback if no displayName
              }
            } catch (userFetchError) {
              console.warn(`Failed to fetch user ${userId}:`, userFetchError);
              creatorDisplayName = `User ${userId.substring(0, 6)} (err)`;
            }
          } else {
             // Handle cases where workout might not be under a user (e.g., global workouts)
             // For now, keeping it simple or you could have a specific logic here
            creatorDisplayName = 'Community Workout';
          }

          const workoutName = workoutData.name || workoutDocumentId; // Use custom name or ID as fallback

          const allMuscles = workoutData.exercises
            .flatMap(ex => ex.muscleGroups)
            .filter(Boolean); // Filter out any undefined/null muscle groups
          const uniqueMuscles = Array.from(new Set(allMuscles));

          return {
            id: workoutDocumentId, // This ID will be used to load the workout on the NewWorkout page
            name: workoutName,
            muscleGroups: uniqueMuscles,
            creatorDisplayName,
          };
        });

        const fetchedWorkouts = await Promise.all(workoutsPromises);
        // Shuffle the fetched workouts for variety, or sort by updatedAt if available
        setRecommendedWorkouts(fetchedWorkouts.sort(() => 0.5 - Math.random()).slice(0, 5)); // Show up to 5
      } catch (err: any) {
        console.error("Error fetching recommended workouts:", err);
        setError('Failed to load workouts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []); // Removed db from dependencies as getFirestore() is stable

  const handleWorkoutClick = (workoutId: string) => {
    // Navigate to NewWorkout page, passing the workout ID as 'workoutName' in state
    // This matches the behavior of YourNextWorkout
    navigate('/newWorkout', { state: { workoutName: workoutId } });
  };

  const styles: { [key: string]: CSSProperties } = {
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 10,
      boxSizing: 'border-box',
      paddingBottom: 8, // Added some padding at the bottom
    },
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginTop: 10, // Consistent with YourNextWorkout's title padding
      marginBottom: 10,
      textAlign: 'center',
    },
    scrollContainer: {
      width: 'calc(100% - 16px)', // 8px margin on each side
      margin: '0 8px',
      overflowX: 'auto',
      overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
    },
    scrollContentContainer: {
      display: 'flex',
      flexDirection: 'row',
      padding: '4px 0 8px 0', // Padding for scrollbar visibility and aesthetics
    },
    workoutItemBase: {
      width: 150,
      marginRight: 12,
      flexShrink: 0,
    },
    workoutCard: {
      width: '100%',
      height: 130, // Fixed height for consistency
      borderRadius: 6,
      backgroundColor: theme.button,
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Distribute space: name top, creator bottom, muscles middle
      alignItems: 'stretch',
      boxSizing: 'border-box',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', // Subtle shadow
      overflow: 'hidden',
      cursor: 'pointer', // Make it look clickable
      WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
      transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out', // Hover effect
    },
    workoutCardHover: { // Example: style for hover, you might need pseudo-class handling or state
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15), 0 3px 3px rgba(0,0,0,0.20)',
    },
    workoutCardName: {
      fontSize: 18, // Adjusted for better fit
      fontWeight: 'bold',
      color: theme.textSecondary,
      marginBottom: 4, // Space below name
      marginTop: 2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center',
    },
    workoutCardMuscleGroups: {
      fontSize: 13, // Adjusted for better fit
      color: theme.textSecondary,
      opacity: 0.85,
      marginBottom: 6,
      marginTop: 0, // Less space above
      display: '-webkit-box',
      WebkitLineClamp: 2, // Max 2 lines
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: '1.4em',
      minHeight: '2.8em', // Ensure space for 2 lines
      flexGrow: 1, // Allow it to take available space
      textAlign: 'center',
    },
    workoutCardCreator: {
      fontSize: 12, // Smaller for subtlety
      color: theme.textSecondary || '#6c757d',
      opacity: 0.7,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center',
      marginTop: 'auto', // Push to bottom if muscle groups don't fill space
    },
    statusText: {
      color: theme.textPrimary,
      marginTop: 20, // More space for status messages
      textAlign: 'center',
      fontSize: 15,
      padding: '0 10px', // Padding for longer messages
    },
  };


  if (isLoading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Recommended Workouts</h2>
        <p style={styles.statusText}>Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Recommended Workouts</h2>
        <p style={{ ...styles.statusText, color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (recommendedWorkouts.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Recommended Workouts</h2>
        <p style={styles.statusText}>No workouts found to recommend.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Recommended Workouts</h2>
      <div style={styles.scrollContainer}>
        <div style={styles.scrollContentContainer}>
          {recommendedWorkouts.map((workout) => (
            <div
              key={workout.id}
              style={styles.workoutItemBase}
              onClick={() => handleWorkoutClick(workout.id)}
              // For accessibility, if not using a button element
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault(); // Prevent scrolling if space is pressed
                  handleWorkoutClick(workout.id);
                }
              }}
            >
              <div
                style={styles.workoutCard}
                // Simple hover effect using onMouseEnter/Leave if not using CSS pseudo-classes
                // onMouseEnter={(e) => (e.currentTarget.style.transform = styles.workoutCardHover.transform!)}
                // onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0px)')}
              >
                <h3
                  style={styles.workoutCardName}
                  title={workout.name} // Tooltip for full name if truncated
                >
                  {workout.name}
                </h3>
                {workout.muscleGroups.length > 0 ? (
                  <p
                    style={styles.workoutCardMuscleGroups}
                    title={workout.muscleGroups.join(', ')} // Tooltip for all muscle groups
                  >
                    {workout.muscleGroups.join(', ')}
                  </p>
                ) : (
                  <p style={styles.workoutCardMuscleGroups}>General Fitness</p> // Fallback
                )}
                <p
                  style={styles.workoutCardCreator}
                  title={`Created by ${workout.creatorDisplayName}`} // Tooltip for creator
                >
                  by: {workout.creatorDisplayName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedWorkouts;