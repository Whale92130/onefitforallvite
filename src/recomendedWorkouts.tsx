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
import { useNavigate } from 'react-router-dom';

interface ExerciseData {
  name: string;
  muscleGroups: string[];
}

interface FirestoreWorkoutDoc {
  exercises: ExerciseData[];
  name?: string; // The custom name of the workout, if set
  updatedAt?: any;
}

interface DisplayWorkoutData {
  id: string; // Document ID of the workout
  name: string; // Display name (Firestore 'name' field or ID)
  muscleGroups: string[];
  creatorDisplayName: string;
  creatorId?: string; // Actual UID of the workout creator
}

const RecommendedWorkouts: FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<DisplayWorkoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      setError(null);
      const db = getFirestore();

      try {
        const workoutsQuery = query(collectionGroup(db, 'workouts'), limit(10));
        const querySnapshot = await getDocs(workoutsQuery);

        const workoutsPromises = querySnapshot.docs.map(async (docSnap) => {
          const workoutData = docSnap.data() as FirestoreWorkoutDoc;
          const workoutDocumentId = docSnap.id; // This is the ID to load the workout

          const pathSegments = docSnap.ref.path.split('/');
          let creatorDisplayName = 'Anonymous';
          let actualCreatorId: string | undefined = undefined;

          if (pathSegments.length >= 3 && pathSegments[0] === 'users' && pathSegments[2] === 'workouts') {
            const userId = pathSegments[1];
            actualCreatorId = userId; // Store the creator's UID
            try {
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists() && typeof userDoc.data().displayName === 'string' && userDoc.data().displayName.trim()) {
                creatorDisplayName = userDoc.data().displayName;
              } else {
                creatorDisplayName = `User ${userId.substring(0, 6)}`;
              }
            } catch (userFetchError) {
              console.warn(`Failed to fetch user ${userId}:`, userFetchError);
              creatorDisplayName = `User ${userId.substring(0, 6)} (err)`;
            }
          } else {
            // Could be a global workout or structured differently
            creatorDisplayName = 'Community Workout';
          }

          const workoutDisplayName = workoutData.name || workoutDocumentId; // Use custom name or ID as fallback

          const allMuscles = workoutData.exercises
            .flatMap(ex => ex.muscleGroups)
            .filter(Boolean);
          const uniqueMuscles = Array.from(new Set(allMuscles));

          return {
            id: workoutDocumentId,
            name: workoutDisplayName,
            muscleGroups: uniqueMuscles,
            creatorDisplayName,
            creatorId: actualCreatorId, // Include the creator's UID
          };
        });

        const fetchedWorkouts = await Promise.all(workoutsPromises);
        setRecommendedWorkouts(fetchedWorkouts.sort(() => 0.5 - Math.random()).slice(0, 5));
      } catch (err: any) {
        console.error("Error fetching recommended workouts:", err);
        setError('Failed to load workouts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const handleWorkoutClick = (workoutId: string, creatorId?: string) => {
    navigate('/newWorkout', { state: { workoutName: workoutId, creatorId: creatorId } });
  };

  // ... (styles and return statement mostly same, just update the onClick) ...

  // Inside the return's map function:
  // {recommendedWorkouts.map((workout) => (
  //   <div
  //     key={workout.id}
  //     style={styles.workoutItemBase}
  //     onClick={() => handleWorkoutClick(workout.id, workout.creatorId)} // MODIFIED HERE
  //     role="button"
  //     tabIndex={0}
  //     onKeyDown={(e) => {
  //       if (e.key === 'Enter' || e.key === ' ') {
  //         e.preventDefault();
  //         handleWorkoutClick(workout.id, workout.creatorId); // MODIFIED HERE
  //       }
  //     }}
  //   >
  //     {/* ... card content ... */}
  //   </div>
  // ))}

  // STYLES (condensed for brevity, assume they are the same as your provided ones)
  const styles: { [key: string]: CSSProperties } = { /* ... your existing styles ... */ 
    container: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: theme.primary, borderRadius: 10, boxSizing: 'border-box', paddingBottom: 8, },
    heading: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginTop: 10, marginBottom: 10, textAlign: 'center', },
    scrollContainer: { width: 'calc(100% - 16px)', margin: '0 8px', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', },
    scrollContentContainer: { display: 'flex', flexDirection: 'row', padding: '4px 0 8px 0', },
    workoutItemBase: { width: 150, marginRight: 12, flexShrink: 0, },
    workoutCard: { width: '100%', height: 130, borderRadius: 6, backgroundColor: theme.button, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out', },
    workoutCardName: { fontSize: 18, fontWeight: 'bold', color: theme.textSecondary, marginBottom: 4, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', },
    workoutCardMuscleGroups: { fontSize: 13, color: theme.textSecondary, opacity: 0.85, marginBottom: 6, marginTop: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4em', minHeight: '2.8em', flexGrow: 1, textAlign: 'center', },
    workoutCardCreator: { fontSize: 12, color: theme.textSecondary || '#6c757d', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' },
    statusText: { color: theme.textPrimary, marginTop: 20, textAlign: 'center', fontSize: 15, padding: '0 10px', },
  };

  if (isLoading) { /* ... */ }
  if (error) { /* ... */ }
  if (recommendedWorkouts.length === 0) { /* ... */ }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Recommended Workouts</h2>
      <div style={styles.scrollContainer}>
        <div style={styles.scrollContentContainer}>
          {recommendedWorkouts.map((workout) => (
            <div
              key={workout.id}
              style={styles.workoutItemBase}
              onClick={() => handleWorkoutClick(workout.id, workout.creatorId)} // Use the handler
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWorkoutClick(workout.id, workout.creatorId); // Use the handler
                }
              }}
            >
              <div style={styles.workoutCard}>
                <h3 style={styles.workoutCardName} title={workout.name}>
                  {workout.name}
                </h3>
                {workout.muscleGroups.length > 0 ? (
                  <p style={styles.workoutCardMuscleGroups} title={workout.muscleGroups.join(', ')}>
                    {workout.muscleGroups.join(', ')}
                  </p>
                ) : (
                  <p style={styles.workoutCardMuscleGroups}>General Fitness</p>
                )}
                <p style={styles.workoutCardCreator} title={`Created by ${workout.creatorDisplayName}`}>
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