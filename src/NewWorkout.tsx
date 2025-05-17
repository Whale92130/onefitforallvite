import React, { useState, FC, CSSProperties } from 'react';
import { useTheme } from './ThemeContext';
import Stopwatch from './stopwatch'; // Only keep if Stopwatch is actually used

interface SetItem {
  weight: string;
  reps: string;
  type: 'regular' | 'warmup' | 'drop';
}

const NewWorkout: FC = () => {
  const [exerciseCount, setExerciseCount] = useState(1);
  const [isWorkoutVisible, setIsWorkoutVisible] = useState(false);

  const addExercise = () => setExerciseCount(c => c + 1);
  const deleteExercise = () => setExerciseCount(c => Math.max(1, c - 1));
  const startWorkout = () => setIsWorkoutVisible(true);
  const {theme } = useTheme();
  return (
    <div>
      <button onClick={startWorkout}
      style={{
        backgroundColor: theme.primary,
        color: theme.textPrimary,
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
      }}>New Workout</button>
      {isWorkoutVisible && (
        <>
          {[...Array(exerciseCount)].map((_, i) => (
            <AddExercise key={i} onDelete={deleteExercise} />
          ))}
          <button onClick={addExercise}>Add Exercise</button>
          {exerciseCount > 1 && (
            <button onClick={deleteExercise}>Remove Exercise</button>
          )}
        </>
      )}
    </div>
  );
};

const AddExercise: FC<{ onDelete: () => void }> = ({ onDelete }) => {
  const [exerciseName, setExerciseName] = useState('');
  const { theme } = useTheme();
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const muscleGroupOptions = [
    'Chest','Back','Shoulders','Biceps','Triceps','Legs','Abs','Cardio'
  ];
  const [sets, setSets] = useState<SetItem[]>([{ weight: '', reps: '', type: 'regular' }]);
  const [bodyweightReps, setBodyweightReps] = useState(false);
  const [lbs, setLbs] = useState(true);

  const handleMuscleGroupChange = (group: string) => {
    setMuscleGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleAddSet = () => {
    setSets([...sets, { weight: bodyweightReps ? 'BW' : '', reps: '', type: 'regular' }]);
  };

  const handleSetChange = (index: number, field: 'weight' | 'reps', value: string) => {
    if (bodyweightReps && field === 'weight' && sets[index].weight === 'BW') return;
    setSets(sets.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleBodyweightToggle = (checked: boolean) => {
    setBodyweightReps(checked);
    setSets(sets.map(s => ({ ...s, weight: checked ? 'BW' : '' })));
  };

  const styles: { [key: string]: CSSProperties } = {
    container: {
      padding: 20,
      position: 'relative',
      fontFamily: 'Arial, sans-serif',
    },
    formBox: {
      padding: 15,
      borderRadius: 5,
      backgroundColor: theme.background,
    },
    input: {
      border: '1px solid black',
      width: '40%',
      padding: '8px 10px',
      marginBottom: 10,
      borderRadius: 4,
      boxSizing: 'border-box',
      fontSize: '1rem',
    },
    toggleContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      gap: 10,
    },
    muscleGroupContainer: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 15,
      gap: 8,
    },
    muscleGroupButton: {
      border: '1px solid gray',
      padding: '8px 12px',
      borderRadius: 5,
      cursor: 'pointer',
      backgroundColor: '#f0f0f0',
      color: 'black',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    },
    selectedMuscleGroup: {
      backgroundColor: theme.button,
      color: 'white',
      borderColor: theme.secondary,
    },
    setRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 10,
    },
    setInput: {
      border: '1px solid black',
      flex: 1,
      minWidth: 70,
      padding: '8px 10px',
      borderRadius: 4,
      boxSizing: 'border-box',
      fontSize: '1rem',
    },
    addSetButton: {
      marginTop: 10,
      padding: '8px 12px',
      border: 'none',
      backgroundColor: theme.primary,
      color: theme.textPrimary,
      borderRadius: 4,
      cursor: 'pointer',
    },
    deleteButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
      padding: 8,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      lineHeight: 1,
    },
    checkbox: {
      // Add styles here to change the appearance of the checkbox
      accentColor: theme.primary, // Example: changes the color of the checked state
      width: '1rem', // Example: adjusts the size
      height: '1rem', // Example: adjusts the size
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.deleteButton}
        onClick={onDelete}
        aria-label="Delete Exercise"
      >
        ❌
      </button>

      <div style={styles.formBox}>
        <label>Exercise Name:</label>
        <input
          type="text"
          style={styles.input}
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
          placeholder="Enter exercise name"
        />

        <div style={styles.toggleContainer}>
          <label>Body Weight Reps</label>
          <input
            type="checkbox"
            checked={bodyweightReps}
            onChange={e => handleBodyweightToggle(e.target.checked)}
            style={styles.checkbox}
          />
        </div>

        <div style={styles.toggleContainer}>
          <label>{lbs ? 'Weight in Lbs' : 'Weight in Kg'}</label>
          <input
            type="checkbox"
            checked={lbs}
            style={styles.checkbox}
            onChange={e => setLbs(e.target.checked)}
          />
        </div>

        <p>Muscle Groups:</p>
        <div style={styles.muscleGroupContainer}>
          {muscleGroupOptions.map(group => (
            <button
              key={group}
              type="button"
              style={{
                ...styles.muscleGroupButton,
                ...(muscleGroups.includes(group) ? styles.selectedMuscleGroup : {})
              }}
              onClick={() => handleMuscleGroupChange(group)}
            >
              {group}
            </button>
          ))}
        </div>

        <p>Sets and Reps:</p>
        {sets.map((set, idx) => (
          <div key={idx} style={styles.setRow}>
            <input
              style={styles.setInput}
              value={set.weight}
              onChange={e => handleSetChange(idx, 'weight', e.target.value)}
              placeholder={lbs ? "Weight (lbs)" : "Weight (kg)"}
              type={bodyweightReps ? 'text' : 'number'}
              readOnly={bodyweightReps && set.weight === 'BW'}
              min={bodyweightReps ? undefined : 0}
              step={bodyweightReps ? undefined : 0.1}
            />
            <input
              style={styles.setInput}
              value={set.reps}
              onChange={e => handleSetChange(idx, 'reps', e.target.value)}
              placeholder="Reps"
              type="number"
              min={0}
            />
          </div>
        ))}

        <button
          type="button"
          style={styles.addSetButton}
          onClick={handleAddSet}
        >
          Add Set
        </button>
      </div>
    </div>
  );
};

export default NewWorkout;
