// src/NewWorkout.tsx
import { useState, useEffect, FC, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
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

  const nameForInitialLoad = (location.state?.workoutName as string | undefined) || propWorkoutName;

  const fetchSavedWorkouts = useCallback(async () => {
    if (!user) return;
    const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
    const snap = await getDocs(userWorkoutsCol);
    setSavedWorkouts(snap.docs.map(d => d.id));
  }, [db, user]);

  const loadWorkout = useCallback(async (name: string) => {
    if (!user) return;
    const userWorkoutsCol = collection(db, 'users', user.uid, 'workouts');
    const snap = await getDoc(doc(userWorkoutsCol, name));
    if (!snap.exists()) {
      alert(`No workout found with name "${name}"`);
      return;
    }
    const data = snap.data();
    setExercises(data.exercises as ExerciseData[]);
    setIsWorkoutVisible(true);
    setLoadListVisible(false);
    setCurrentWorkoutName(name);
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
      name: '',
      muscleGroups: [],
      sets: [{ weight: '', reps: '', type: 'regular' }],
      bodyweight: false,
      lbs: true,
    }]);
    setIsWorkoutVisible(true);
    setLoadListVisible(false);
    setCurrentWorkoutName('');
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

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={startWorkout}
        style={{
          backgroundColor: theme.primary,
          color: theme.textPrimary,
          padding: '10px 20px',
          borderRadius: 5,
          border: 'none',
          cursor: 'pointer',
          marginRight: 8,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        New Workout
      </button>

      <button onClick={handleSavePopupOpen} style={{
        backgroundColor: theme.primary,
        color: theme.textPrimary,
        padding: '10px 20px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        marginRight: 8,
        WebkitTapHighlightColor: 'transparent',
      }}>
        Save Workout
      </button>

      <button onClick={() => { setLoadListVisible(v => !v); if (!loadListVisible) fetchSavedWorkouts(); }} style={{
        backgroundColor: theme.primary,
        color: theme.textPrimary,
        padding: '10px 20px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        marginRight: 8,
        marginTop: 8,
        WebkitTapHighlightColor: 'transparent',
      }}>
        {loadListVisible ? 'Hide Saved' : 'Load Workout'}
      </button>

      {loadListVisible && (
        <div style={{ marginTop: 10, }}>
          {savedWorkouts.length
            ? savedWorkouts.map(name => (
              <div key={name} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                <button onClick={() => loadWorkout(name)} style={{
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
                }}>{name}</button>
                <button onClick={() => deleteWorkout(name)} style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                  WebkitTapHighlightColor: 'transparent',
                }}>❌</button>
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
              key={i} // CHANGED: Use the stable index as the key
              index={i}
              data={ex}
              onChange={d => updateExercise(i, d)}
              onDelete={() => {
                setExercises(exs => exs.filter((_, idx) => idx !== i));
              }}
            />
          ))}

          <div style={{ marginTop: 12 }}>
            <button onClick={addExercise} style={{
              backgroundColor: theme.primary,
              color: theme.textPrimary,
              padding: '10px 20px',
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              marginRight: 8,
              WebkitTapHighlightColor: 'transparent',
            }}>Add Exercise</button>
          </div>
        </div>
      )}

      {isSavePopupVisible && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: theme.background, padding: 20, borderRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: theme.textPrimary, marginTop: 0, marginBottom: 15 }}>Name your workout:</h3>
            <input
              type="text"
              value={currentWorkoutName}
              onChange={(e) => setCurrentWorkoutName(e.target.value)}
              placeholder="Enter workout name"
              style={{ marginBottom: 20, padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 'calc(100% - 22px)', fontSize: '1rem' }}
            />
            <div>
              <button onClick={saveWorkout} style={{ marginRight: 10, padding: '10px 15px', backgroundColor: theme.primary, color: theme.textPrimary, border: 'none', borderRadius: 4, cursor: 'pointer',WebkitTapHighlightColor: 'transparent', }}>Save</button>
              <button onClick={() => { setIsSavePopupVisible(false); }} style={{ padding: '10px 15px', backgroundColor: theme.background, color: theme.textPrimary, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer',WebkitTapHighlightColor: 'transparent', }}>Cancel</button>
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
}> = ({data, onChange, onDelete }) => {
  const { theme } = useTheme();

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
    if (data.sets.length <= 1) return;
    update({
      sets: data.sets.filter((_, idx) => idx !== i),
    });
  };

  const styles: { [k: string]: React.CSSProperties } = {
    // container: { padding: 20, position: 'relative', fontFamily: 'Arial, sans-serif' }, // Original container
    container: { padding: '20px 0', marginBottom: 0, position: 'relative', fontFamily: 'Arial, sans-serif' }, // Adjusted, using #eee
    formBox: { padding: 15, borderRadius: 5, backgroundColor: theme.background, border: '1px solid #ddd' }, // Using #ddd for border
    label: { display: 'block', marginBottom: 5, color: theme.textPrimary, fontSize: '0.9rem' }, // Changed label color to theme.textPrimary for better visibility
    input: { border: `1px solid ${theme.textPrimary}`, width: '100%', padding: '8px 10px', marginBottom: 10, borderRadius: 4, boxSizing: 'border-box', fontSize: '1rem', backgroundColor: theme.background, color: theme.textPrimary }, // Reverted to original input border and using theme colors
    checkboxContainer: {WebkitTapHighlightColor: 'transparent', display: 'flex', alignItems: 'center', marginBottom: 10 },
    checkboxLabel: { marginRight: 8, color: theme.textPrimary },
    checkbox: { accentColor: theme.primary, width: '1rem', height: '1rem', cursor: 'pointer' },
    muscleBtn: { border: '1px solid gray', padding: '8px 12px', borderRadius: 5, cursor: 'pointer', backgroundColor: '#f0f0f0', color: 'black', fontSize: '0.9rem', marginRight: 6, marginBottom: 6 }, // Original non-selected style
    setRow: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' },
    setInput: { border: `1px solid ${theme.textPrimary}`, flex: 1, minWidth: 70, padding: '8px 10px', borderRadius: 4, boxSizing: 'border-box', fontSize: '1rem', backgroundColor: theme.background, color: theme.textPrimary }, // Reverted to original setInput border and using theme colors
    addSetBtn: {WebkitTapHighlightColor: 'transparent', marginTop: 10, padding: '8px 12px', border: 'none', backgroundColor: theme.primary, color: theme.textPrimary, borderRadius: 4, cursor: 'pointer' },
    deleteExerciseBtn: { position: 'absolute', top: 20, right: 5, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '5px' /* color: theme.textPrimary - emoji color is fine */ }, // Original style, removed explicit color for emoji
    removeSetBtn: {WebkitTapHighlightColor: 'transparent', background: 'transparent', color: 'red', border: 'none', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, fontSize: '1rem' },
  };

  const muscleGroupOptions = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'];

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
                ...styles.muscleBtn, // Base style (original non-selected)
                ...(data.muscleGroups.includes(group)
                  ? { backgroundColor: theme.button, color: 'white' } // Original selected style
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