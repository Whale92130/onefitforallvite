// src/NewWorkout.tsx
import { useState, useEffect, FC, useCallback, CSSProperties } from 'react'; // Added CSSProperties
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';

/////////////////////////////////////////
// ─── Shared Types ────────────────────
/////////////////////////////////////////
interface SetItem {
  weight: string;
  reps: string;
  type: 'regular' | 'warmup' | 'drop';
}
interface ExerciseData {
  name: string;
  muscleGroups: string[];
  sets: SetItem[];
  bodyweight: boolean;
  lbs: boolean;
}

/////////////////////////////////////////
// ─── Parent: NewWorkout ─────────────
/////////////////////////////////////////
interface NewWorkoutProps {
  workoutName?: string;
}

const MINUTES_PER_CRATE = 15;
const MAX_DAILY_WORKOUT_MINUTES_FOR_CRATES = MINUTES_PER_CRATE*8;


const NewWorkout: FC<NewWorkoutProps> = ({ workoutName: propWorkoutName }) => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const { theme } = useTheme();
  const location = useLocation();

  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [isWorkoutVisible, setIsWorkoutVisible] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState<string[]>([]);
  const [isSavePopupVisible, setIsSavePopupVisible] = useState(false);
  const [currentWorkoutName, setCurrentWorkoutName] = useState('');
  const [loadListVisible, setLoadListVisible] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [finishWorkoutMessage, setFinishWorkoutMessage] = useState<string | null>(null);

  const nameForInitialLoad = (location.state?.workoutName as string | undefined) || propWorkoutName;

  const fetchSavedWorkouts = useCallback(async () => {
    if (!user) return;
    const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
    const snap = await getDocs(userWorkoutsCol);
    setSavedWorkouts(snap.docs.map(d => d.id));
  }, [db, user]);

  const loadWorkout = useCallback(async (name: string) => {
    if (!user) return;
    setWorkoutStartTime(new Date());
    const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
    const snap = await getDoc(doc(userWorkoutsCol, name));
    if (!snap.exists()) {
      alert(`No workout found with name "${name}"`);
      setWorkoutStartTime(null);
      return;
    }
    const data = snap.data();
    setExercises(data.exercises as ExerciseData[]);
    setIsWorkoutVisible(true);
    setLoadListVisible(false);
    setCurrentWorkoutName(name);
    setFinishWorkoutMessage(null);
  }, [db, user]);

  const saveWorkout = useCallback(async () => {
    if (!user) {
      alert('Please sign in to save workouts.');
      return;
    }
    const trimmedWorkoutName = currentWorkoutName.trim();
    if (!trimmedWorkoutName) {
      alert('Please enter a name for the workout.');
      return;
    }
    const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
    const docRef = doc(userWorkoutsCol, trimmedWorkoutName);
    await setDoc(docRef, {
      exercises,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    fetchSavedWorkouts();
    setIsSavePopupVisible(false);
  }, [db, user, exercises, currentWorkoutName, fetchSavedWorkouts]);

  const deleteWorkout = useCallback(async (name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      if (!user) return;
      const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
      const docRef = doc(userWorkoutsCol, name);
      await deleteDoc(docRef);
      fetchSavedWorkouts();
      if (currentWorkoutName === name) {
        setExercises([]);
        setIsWorkoutVisible(false);
        setCurrentWorkoutName('');
        setWorkoutStartTime(null);
      }
    }
  }, [db, user, fetchSavedWorkouts, currentWorkoutName]);

  useEffect(() => {
    if (user) {
      fetchSavedWorkouts();
    }
    if (nameForInitialLoad) {
      loadWorkout(nameForInitialLoad);
    }
  }, [user, nameForInitialLoad, fetchSavedWorkouts, loadWorkout, location.state]);

  const startWorkout = () => {
    setExercises([{
      name: '', muscleGroups: [], sets: [{ weight: '', reps: '', type: 'regular' }],
      bodyweight: false, lbs: true,
    }]);
    setIsWorkoutVisible(true);
    setLoadListVisible(false);
    setCurrentWorkoutName('');
    setWorkoutStartTime(new Date());
    setFinishWorkoutMessage(null);
  };

  const updateExercise = (idx: number, data: ExerciseData) => {
    setExercises(exs => {
      const copy = [...exs];
      copy[idx] = data;
      return copy;
    });
  };

  const addExercise = () => {
    setExercises(exs => [
      ...exs,
      { name: '', muscleGroups: [], sets: [{ weight: '', reps: '', type: 'regular' }], bodyweight: false, lbs: true }
    ]);
  };

  const handleSavePopupOpen = () => {
    if (!isWorkoutVisible || exercises.length === 0) {
      alert("Start a workout and add exercises before saving.");
      return;
    }
    setIsSavePopupVisible(true);
  };

  const handleFinishWorkout = async () => {
    if (!user || !workoutStartTime) return;
    const endTime = new Date();
    const durationMs = endTime.getTime() - workoutStartTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    let cratesEarned = 0;
    let message = "";

    if (durationMinutes < MINUTES_PER_CRATE) {
      message = `Your workout was ${durationMinutes} min. Work out for at least ${MINUTES_PER_CRATE} minutes to earn a crate! Keep it up!`;
    } else {
      const userRef = doc(db, "users", user.uid);
      let dailyMinutesAlreadyWorkedOut = 0;
      const todayDateString = new Date().toISOString().split('T')[0];

      try {
        const userDocSnap = await getDoc(userRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.lastWorkoutDate === todayDateString) {
            dailyMinutesAlreadyWorkedOut = userData.dailyWorkoutDurationMinutes || 0;
          }
        } else {
          await setDoc(userRef, { crateCount: 0, dailyWorkoutDurationMinutes: 0, lastWorkoutDate: "" }, { merge: true });
        }

        const remainingDailyMinutesForCrates = MAX_DAILY_WORKOUT_MINUTES_FOR_CRATES - dailyMinutesAlreadyWorkedOut;
        const effectiveDurationForCrates = Math.min(durationMinutes, remainingDailyMinutesForCrates);

        if (effectiveDurationForCrates <= 0) {
          message = `You've reached your daily limit of ${MAX_DAILY_WORKOUT_MINUTES_FOR_CRATES / 60} hours of workout time for earning crates today. Great job!`;
        } else {
          cratesEarned = Math.floor(effectiveDurationForCrates / MINUTES_PER_CRATE);
          if (cratesEarned > 0) {
            await updateDoc(userRef, {
              crateCount: increment(cratesEarned),
              dailyWorkoutDurationMinutes: increment(effectiveDurationForCrates),
              lastWorkoutDate: todayDateString,
              lastCrateEarnedAt: serverTimestamp()
            });
            message = `Workout finished! Duration: ${durationMinutes} min. You earned ${cratesEarned} crate(s)!`;
          } else {
             message = `Your workout was ${durationMinutes} min. You've earned all possible crates for today based on your workout time or need ${MINUTES_PER_CRATE - (effectiveDurationForCrates % MINUTES_PER_CRATE)} more minutes for the next crate.`;
          }
        }
      } catch (error) {
        console.error("Error finishing workout and awarding crates:", error);
        message = "An error occurred while finishing your workout. Please try again.";
      }
    }
    setFinishWorkoutMessage(message);
    setIsWorkoutVisible(false);
    setExercises([]);
    setCurrentWorkoutName('');
    setWorkoutStartTime(null);
  };

  // STYLES FOR NewWorkout COMPONENT (buttons, popups etc.)
  const newWorkoutStyles: { [k: string]: CSSProperties } = {
    button: {
        backgroundColor: theme.primary,
        color: theme.textPrimary,
        padding: '10px 20px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        marginRight: 8,
        WebkitTapHighlightColor: 'transparent',
    },
    loadListItemButton: {
        backgroundColor: theme.primary,
        color: theme.textPrimary,
        padding: '10px 20px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        marginRight: 8,
        flexGrow: 1,
        textAlign: 'center',
        WebkitTapHighlightColor: 'transparent',
    },
    deleteIcon: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        WebkitTapHighlightColor: 'transparent',
    },
    addExerciseButton: {
        backgroundColor: theme.primary,
        color: theme.textPrimary,
        padding: '10px 20px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        marginRight: 8,
        WebkitTapHighlightColor: 'transparent',
    },
    finishButton: {
        backgroundColor: 'green', // Or theme.success
        color: 'white', // Or theme.textOnSuccess
        padding: '10px 20px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
    },
    popupBackdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    popupContent: {
        backgroundColor: theme.background, padding: 20, borderRadius: 8,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    popupTitle: {
        color: theme.textPrimary, marginTop: 0, marginBottom: 15
    },
    popupInput: {
        marginBottom: 20, padding: '10px', borderRadius: 4,
        border: '1px solid #ccc', width: 'calc(100% - 22px)', fontSize: '1rem'
    },
    popupSaveButton: {
        marginRight: 10, padding: '10px 15px', backgroundColor: theme.primary,
        color: theme.textPrimary, border: 'none', borderRadius: 4, cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
    },
    popupCancelButton: {
        padding: '10px 15px', backgroundColor: theme.background, color: theme.textPrimary,
        border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
    },
    finishMessage: {
        marginTop: 15, padding: 10, backgroundColor: theme.secondary,
        color: theme.textSecondary, borderRadius: 5, textAlign: 'center'
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <button onClick={startWorkout} style={{...newWorkoutStyles.button, marginTop: 8}}>New Workout</button>
      <button onClick={handleSavePopupOpen} style={{...newWorkoutStyles.button, marginTop: 8}}>Save Workout</button>
      <button onClick={() => { setLoadListVisible(v => !v); if (!loadListVisible) fetchSavedWorkouts(); }} style={{...newWorkoutStyles.button, marginTop: 8}}>
        {loadListVisible ? 'Hide Saved' : 'Load Workout'}
      </button>

      {finishWorkoutMessage && (
        <div style={newWorkoutStyles.finishMessage}>
          <p>{finishWorkoutMessage}</p>
        </div>
      )}

      {loadListVisible && (
        <div style={{ marginTop: 10 }}>
          {savedWorkouts.length
            ? savedWorkouts.map(name => (
              <div key={name} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                <button onClick={() => loadWorkout(name)} style={newWorkoutStyles.loadListItemButton}>{name}</button>
                <button onClick={() => deleteWorkout(name)} style={newWorkoutStyles.deleteIcon}>❌</button>
              </div>
            ))
            : <p style={{ color: theme.textPrimary }}>No saved workouts.</p>
          }
        </div>
      )}

      {isWorkoutVisible && (
        <div style={{ marginTop: 20 }}>
          {exercises.map((ex, i) => (
            <AddExercise
              key={i}
              index={i}
              data={ex}
              onChange={d => updateExercise(i, d)}
              onDelete={() => {
                setExercises(exs => exs.filter((_, idx) => idx !== i));
              }}
            />
          ))}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={addExercise} style={newWorkoutStyles.addExerciseButton}>Add Exercise</button>
            <button onClick={handleFinishWorkout} style={newWorkoutStyles.finishButton}>
              Finish Workout
            </button>
          </div>
        </div>
      )}

      {isSavePopupVisible && (
        <div style={newWorkoutStyles.popupBackdrop}>
          <div style={newWorkoutStyles.popupContent}>
            <h3 style={newWorkoutStyles.popupTitle}>Name your workout:</h3>
            <input
              type="text"
              value={currentWorkoutName}
              onChange={(e) => setCurrentWorkoutName(e.target.value)}
              placeholder="Enter workout name"
              style={newWorkoutStyles.popupInput}
            />
            <div>
              <button onClick={saveWorkout} style={newWorkoutStyles.popupSaveButton}>Save</button>
              <button onClick={() => { setIsSavePopupVisible(false); }} style={newWorkoutStyles.popupCancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/////////////////////////////////////////
// ─── Child: AddExercise ─────────────
/////////////////////////////////////////

const AddExercise: FC<{
  index: number;
  data: ExerciseData;
  onChange: (data: ExerciseData) => void;
  onDelete: () => void;
}> = ({data, onChange, onDelete }) => { // Destructure props correctly
  const { theme } = useTheme();

  // muscleGroupOptions MUST be defined inside AddExercise or passed as a prop
  const muscleGroupOptions = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'];

  // styles object MUST be defined inside AddExercise or passed as a prop
  const styles: { [k: string]: React.CSSProperties } = {
    container: { padding: '20px 0', marginBottom: 0, position: 'relative', fontFamily: 'Arial, sans-serif' },
    formBox: { padding: 15, borderRadius: 5, backgroundColor: theme.background, border: `1px solid ${theme.secondary || '#ddd'}` }, // use theme.secondary
    label: { display: 'block', marginBottom: 5, color: theme.textPrimary, fontSize: '0.9rem' },
    input: { border: `1px solid ${theme.textSecondary || '#ccc'}`, width: '100%', padding: '8px 10px', marginBottom: 10, borderRadius: 4, boxSizing: 'border-box', fontSize: '1rem', backgroundColor: theme.background, color: theme.textPrimary },
    checkboxContainer: { WebkitTapHighlightColor: 'transparent', display: 'flex', alignItems: 'center', marginBottom: 10 },
    checkboxLabel: { marginRight: 8, color: theme.textPrimary },
    checkbox: { accentColor: theme.primary, width: '1rem', height: '1rem', cursor: 'pointer' },
    muscleBtn: { border: '1px solid gray', padding: '8px 12px', borderRadius: 5, cursor: 'pointer', backgroundColor: theme.secondary, color: theme.textSecondary, fontSize: '0.9rem', marginRight: 6, marginBottom: 6, WebkitTapHighlightColor: 'transparent', },
    selectedMuscleBtn: { backgroundColor: theme.button, color: theme.textPrimary }, // Differentiate selected style
    setRow: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' },
    setInput: { border: `1px solid ${theme.textSecondary || '#ccc'}`, flex: 1, minWidth: 70, padding: '8px 10px', borderRadius: 4, boxSizing: 'border-box', fontSize: '1rem', backgroundColor: theme.background, color: theme.textPrimary },
    addSetBtn: { WebkitTapHighlightColor: 'transparent', marginTop: 10, padding: '8px 12px', border: 'none', backgroundColor: theme.primary, color: theme.textPrimary, borderRadius: 4, cursor: 'pointer' },
    deleteExerciseBtn: { position: 'absolute', top: 20, right: 5, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '5px', WebkitTapHighlightColor: 'transparent', },
    removeSetBtn: { WebkitTapHighlightColor: 'transparent', background: 'transparent', color: 'red', border: 'none', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, fontSize: '1rem' },
  };


  const update = (change: Partial<ExerciseData>) => {
    onChange({ ...data, ...change });
  };

  const toggleBodyweight = (checked: boolean) => {
    update({
      bodyweight: checked,
      sets: data.sets.map(s => ({ ...s, weight: checked ? 'BW' : '' })),
    });
  };
  const toggleUnits = (checked: boolean) => update({ lbs: checked });
  const changeName = (name: string) => update({ name });
  const changeMuscleGroup = (group: string) => {
    const mg = data.muscleGroups.includes(group)
      ? data.muscleGroups.filter(g => g !== group)
      : [...data.muscleGroups, group];
    update({ muscleGroups: mg });
  };
  const changeSet = (i: number, field: 'weight' | 'reps', val: string) => {
    const sets = data.sets.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    );
    update({ sets });
  };
  const addSet = () => {
    update({
      sets: [...data.sets, { weight: data.bodyweight ? 'BW' : '', reps: '', type: 'regular' }],
    });
  };
  const removeSet = (i: number) => {
    if (data.sets.length <= 1) return; // Keep at least one set
    update({
      sets: data.sets.filter((_, idx) => idx !== i),
    });
  };


  return (
    <div style={styles.container}>
      <button onClick={onDelete} style={styles.deleteExerciseBtn} aria-label="Delete Exercise">❌</button>
      <div style={styles.formBox}>
        <label style={styles.label}>Exercise Name:</label>
        <input
          style={styles.input}
          type="text"
          value={data.name}
          onChange={e => changeName(e.target.value)}
          placeholder="Enter exercise name"
        />

        <div style={styles.checkboxContainer}>
          <label style={styles.checkboxLabel}>Bodyweight Reps</label>
          <input
            type="checkbox"
            checked={data.bodyweight}
            onChange={e => toggleBodyweight(e.target.checked)}
            style={styles.checkbox}
          />
        </div>

        {!data.bodyweight && (
          <div style={styles.checkboxContainer}>
            <label style={styles.checkboxLabel}>{data.lbs ? 'Weight in Lbs' : 'Weight in Kg'}</label>
            <input
              type="checkbox"
              checked={data.lbs}
              onChange={e => toggleUnits(e.target.checked)}
              style={styles.checkbox}
            />
          </div>
        )}

        <p style={{ color: theme.textPrimary, marginBottom: 8, marginTop: 15 }}>Muscle Groups:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 15 }}>
          {muscleGroupOptions.map(group => ( // muscleGroupOptions is now correctly in scope
            <button
              key={group}
              type="button"
              onClick={() => changeMuscleGroup(group)}
              style={{
                ...styles.muscleBtn,
                ...(data.muscleGroups.includes(group)
                  ? styles.selectedMuscleBtn // Use the dedicated selected style
                  : {}),
              }}
            >
              {group}
            </button>
          ))}
        </div>

        <p style={{ color: theme.textPrimary, marginBottom: 8, marginTop: 15 }}>Sets & Reps:</p>
        {data.sets.map((set, i) => (
          <div key={i} style={styles.setRow}>
            <input
              style={styles.setInput}
              type={data.bodyweight ? 'text' : 'number'}
              readOnly={data.bodyweight}
              placeholder={data.bodyweight ? 'BW' : (data.lbs ? 'lbs' : 'kg')}
              value={set.weight}
              onChange={e => changeSet(i, 'weight', e.target.value)}
              min={data.bodyweight ? undefined : "0"}
            />
            <input
              style={styles.setInput}
              type="number"
              placeholder="reps"
              value={set.reps}
              onChange={e => changeSet(i, 'reps', e.target.value)}
              min="0"
            />
            {data.sets.length > 1 && (
              <button type="button" onClick={() => removeSet(i)} style={styles.removeSetBtn} aria-label="Remove Set">❌</button>
            )}
          </div>
        ))}

        <button type="button" onClick={addSet} style={styles.addSetBtn}>
          Add Set
        </button>
      </div>
    </div>
  );
};

export default NewWorkout;