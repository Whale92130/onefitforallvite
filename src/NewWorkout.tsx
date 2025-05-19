// src/NewWorkout.tsx
import { useState, useEffect, FC, useCallback, CSSProperties } from 'react';
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
  DocumentSnapshot,
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

// Location state can now include creatorId
interface WorkoutLocationState {
  workoutName?: string;
  creatorId?: string;
}

const MINUTES_PER_CRATE = 15;
const MAX_DAILY_WORKOUT_MINUTES_FOR_CRATES = MINUTES_PER_CRATE * 8;


const NewWorkout: FC<NewWorkoutProps> = ({ workoutName: propWorkoutName }) => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const { theme } = useTheme();
  const location = useLocation();
  const locationState = location.state as WorkoutLocationState | null;

  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [isWorkoutVisible, setIsWorkoutVisible] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState<string[]>([]);
  const [isSavePopupVisible, setIsSavePopupVisible] = useState(false);
  const [currentWorkoutName, setCurrentWorkoutName] = useState('');
  const [loadListVisible, setLoadListVisible] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [finishWorkoutMessage, setFinishWorkoutMessage] = useState<string | null>(null);

  const fetchSavedWorkouts = useCallback(async () => {
    if (!user) return;
    const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
    const snap = await getDocs(userWorkoutsCol);
    setSavedWorkouts(snap.docs.map(d => d.id));
  }, [db, user]);

  const loadWorkout = useCallback(async (workoutIdentifier: string, sourceCreatorId?: string) => {
    console.log(`Attempting to load workout: ID='${workoutIdentifier}', CreatorID='${sourceCreatorId}'`);
    setFinishWorkoutMessage(null);

    let workoutDocSnap: DocumentSnapshot | null = null;
    let workoutDataToSet: ExerciseData[] | null = null;
    let nameToSetForCurrentWorkout = '';
    let fetchedSuccessfully = false;

    if (user && (!sourceCreatorId || sourceCreatorId === user.uid)) {
      console.log(`Checking current user's workouts for '${workoutIdentifier}'`);
      const userWorkoutRef = doc(db, 'users', user.uid, 'workouts', workoutIdentifier);
      workoutDocSnap = await getDoc(userWorkoutRef);
      if (workoutDocSnap.exists()) {
        const data = workoutDocSnap.data();
        workoutDataToSet = data.exercises as ExerciseData[];
        nameToSetForCurrentWorkout = data.name || workoutIdentifier; // Prefer 'name' field if it exists, else ID
        fetchedSuccessfully = true;
        console.log("Loaded workout from current user's collection:", nameToSetForCurrentWorkout);
      }
    }

    if (!fetchedSuccessfully && sourceCreatorId && user && sourceCreatorId !== user.uid) {
      console.log(`Checking community workouts: Creator='${sourceCreatorId}', WorkoutID='${workoutIdentifier}'`);
      const communityWorkoutRef = doc(db, 'users', sourceCreatorId, 'workouts', workoutIdentifier);
      try {
        workoutDocSnap = await getDoc(communityWorkoutRef);
        if (workoutDocSnap.exists()) {
          const data = workoutDocSnap.data();
          workoutDataToSet = data.exercises as ExerciseData[];
          nameToSetForCurrentWorkout = data.name || workoutIdentifier;
          fetchedSuccessfully = true;
          console.log("Loaded workout from community collection:", nameToSetForCurrentWorkout);
        } else {
          console.warn(`Recommended workout ID "${workoutIdentifier}" by creator "${sourceCreatorId}" not found.`);
        }
      } catch (error) {
        console.error(`Error fetching recommended workout ${workoutIdentifier} by ${sourceCreatorId}:`, error);
      }
    } else if (!fetchedSuccessfully && sourceCreatorId && !user) {
      console.log(`Checking community workouts (view-only): Creator='${sourceCreatorId}', WorkoutID='${workoutIdentifier}'`);
      const communityWorkoutRef = doc(db, 'users', sourceCreatorId, 'workouts', workoutIdentifier);
      try {
          workoutDocSnap = await getDoc(communityWorkoutRef);
          if (workoutDocSnap.exists()) {
              const data = workoutDocSnap.data();
              workoutDataToSet = data.exercises as ExerciseData[];
              nameToSetForCurrentWorkout = data.name || workoutIdentifier;
              fetchedSuccessfully = true;
              console.log("Loaded (view-only) workout from community collection:", nameToSetForCurrentWorkout);
          } else {
               console.warn(`Recommended workout (view-only) ID "${workoutIdentifier}" by creator "${sourceCreatorId}" not found.`);
          }
      } catch (error) {
          console.error(`Error fetching (view-only) recommended workout:`, error);
      }
    }

    if (fetchedSuccessfully && workoutDataToSet) {
      setExercises(workoutDataToSet);
      setIsWorkoutVisible(true);
      setLoadListVisible(false);
      setCurrentWorkoutName(nameToSetForCurrentWorkout);
      setWorkoutStartTime(new Date());
    } else {
      if (workoutIdentifier) {
        alert(`Could not load workout "${workoutIdentifier}". It might have been deleted or does not exist.`);
      }
      setWorkoutStartTime(null);
    }
  }, [db, user]);

  useEffect(() => {
    const workoutIdFromLocation = locationState?.workoutName;
    const creatorIdFromLocation = locationState?.creatorId;

    if (workoutIdFromLocation) {
      loadWorkout(workoutIdFromLocation, creatorIdFromLocation);
    } else if (propWorkoutName) {
      loadWorkout(propWorkoutName, undefined);
    }
  }, [loadWorkout, propWorkoutName, locationState?.workoutName, locationState?.creatorId, location.key]);

  useEffect(() => {
    if (user) {
      fetchSavedWorkouts();
    }
  }, [user, fetchSavedWorkouts]);

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

    const validExercises = exercises.filter(ex => ex.name.trim() !== '' && ex.sets.length > 0 && ex.sets.some(s => s.reps.trim() !== ''));
    if (validExercises.length === 0) {
        alert("Please add at least one exercise with a name and some reps before saving.");
        return;
    }

    await setDoc(docRef, {
      exercises: validExercises,
      name: trimmedWorkoutName,
      updatedAt: serverTimestamp(),
      originalCreatorId: locationState?.creatorId || user.uid, // Simplified: if no locationState.creatorId, it's user's own or new
      isCopy: !!(locationState?.creatorId && locationState.creatorId !== user.uid),
    }, { merge: true });

    fetchSavedWorkouts();
    setIsSavePopupVisible(false);
    alert(`Workout "${trimmedWorkoutName}" saved!`);
  }, [db, user, exercises, currentWorkoutName, fetchSavedWorkouts, locationState]);

  const deleteWorkout = useCallback(async (nameToDelete: string) => {
    if (!user) return;
    if (confirm(`Are you sure you want to delete "${nameToDelete}" from your saved workouts?`)) {
      const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
      const docRef = doc(userWorkoutsCol, nameToDelete);
      await deleteDoc(docRef);
      fetchSavedWorkouts();
      if (currentWorkoutName === nameToDelete && isWorkoutVisible) {
        setExercises([]);
        setIsWorkoutVisible(false);
        setCurrentWorkoutName('');
        setWorkoutStartTime(null);
      }
    }
  }, [db, user, fetchSavedWorkouts, currentWorkoutName, isWorkoutVisible]);

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
    if (!user) {
        alert("Please sign in to save workouts.");
        return;
    }
    if (!isWorkoutVisible || exercises.length === 0 || exercises.every(ex => ex.name.trim() === '')) {
      alert("Start a workout and add at least one named exercise before saving.");
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
      <button onClick={() => { setLoadListVisible(v => !v); if (user) fetchSavedWorkouts(); }} style={{...newWorkoutStyles.button, marginTop: 8}}>
        {loadListVisible ? 'Hide Saved' : 'Load Workout'}
      </button>

      {finishWorkoutMessage && (
        <div style={newWorkoutStyles.finishMessage}>
          <p>{finishWorkoutMessage}</p>
        </div>
      )}

      {loadListVisible && user && (
        <div style={{ marginTop: 10 }}>
          {savedWorkouts.length > 0
            ? savedWorkouts.map(name => (
              <div key={name} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                <button onClick={() => loadWorkout(name, undefined)} style={newWorkoutStyles.loadListItemButton}>{name}</button>
                <button onClick={() => deleteWorkout(name)} style={newWorkoutStyles.deleteIcon}>❌</button>
              </div>
            ))
            : <p style={{ color: theme.textPrimary }}>No saved workouts.</p>
          }
        </div>
      )}
       {loadListVisible && !user && (
        <p style={{ color: theme.textPrimary, marginTop: 10 }}>Please sign in to see your saved workouts.</p>
      )}

      {isWorkoutVisible && (
        <div style={{ marginTop: 20 }}>
          {currentWorkoutName && <h3 style={{color: theme.textPrimary, textAlign: 'center'}}>Current: {currentWorkoutName}</h3>}
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
            <button onClick={handleFinishWorkout} style={newWorkoutStyles.finishButton} disabled={!user}>
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
              {/* CORRECTED TYPO HERE */}
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
}> = ({data, onChange, onDelete }) => { // `index` is passed but not destructured if not used internally. This matches your original structure.
  const { theme } = useTheme();

  const muscleGroupOptions = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'];

  const styles: { [k: string]: React.CSSProperties } = {
    container: { padding: '20px 0', marginBottom: 0, position: 'relative', fontFamily: 'Arial, sans-serif' },
    formBox: { padding: 15, borderRadius: 5, backgroundColor: theme.background, border: `1px solid ${theme.secondary || '#ddd'}` },
    label: { display: 'block', marginBottom: 5, color: theme.textPrimary, fontSize: '0.9rem' },
    input: { border: `1px solid ${theme.textSecondary || '#ccc'}`, width: '100%', padding: '8px 10px', marginBottom: 10, borderRadius: 4, boxSizing: 'border-box', fontSize: '1rem', backgroundColor: theme.background, color: theme.textPrimary },
    checkboxContainer: { WebkitTapHighlightColor: 'transparent', display: 'flex', alignItems: 'center', marginBottom: 10 },
    checkboxLabel: { marginRight: 8, color: theme.textPrimary },
    checkbox: { accentColor: theme.primary, width: '1rem', height: '1rem', cursor: 'pointer' },
    muscleBtn: { border: '1px solid gray', padding: '8px 12px', borderRadius: 5, cursor: 'pointer', backgroundColor: theme.secondary, color: theme.textSecondary, fontSize: '0.9rem', marginRight: 6, marginBottom: 6, WebkitTapHighlightColor: 'transparent', },
    selectedMuscleBtn: { backgroundColor: theme.button, color: theme.textPrimary },
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
          {muscleGroupOptions.map(group => (
            <button
              key={group}
              type="button"
              onClick={() => changeMuscleGroup(group)}
              style={{
                ...styles.muscleBtn,
                ...(data.muscleGroups.includes(group)
                  ? styles.selectedMuscleBtn
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