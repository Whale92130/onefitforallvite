// src/components/AddExercise.tsx (using TypeScript since original uses FC and interfaces)
import React, { useState, FC } from 'react';
import Stopwatch from './stopwatch';
import styles from './AddExercise.module.css'; // We'll create this CSS module

interface SetItem { // Renamed Set to SetItem to avoid conflict with built-in Set
  weight: string;
  reps: string;
  type: 'regular' | 'warmup' | 'drop';
}

interface Props {
  onDelete: () => void;
}

interface NewWorkoutProps {
}

const AddExercise: FC<Props> = ({ onDelete }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const muscleGroupOptions = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio',
  ];

  const handleMuscleGroupChange = (itemValue: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.includes(itemValue) ? prevGroups.filter(group => group !== itemValue) : [...prevGroups, itemValue]
    );
  };

  const [sets, setSets] = useState<SetItem[]>([{ weight: '', reps: '', type: 'regular' }]);
  const [bodyweightReps, setBodyweightReps] = useState(false);
  const [lbs, setLbs] = useState(true);

  const handleAddSet = () => {
    setSets([...sets, { weight: bodyweightReps ? 'BW' : '', reps: '', type: 'regular' }]);
  };

 const handleSetChange = (index: number, field: 'weight' | 'reps', value: string) => {
 // If bodyweight reps are active and user tries to change weight, prevent it
    // Or, allow changing FROM 'BW' if bodyweightReps is turned off
    if (bodyweightReps && field === 'weight' && sets[index].weight === 'BW') {
        return; // Don't allow changing weight if it's 'BW' and bodyweightReps is on
    }
    const newSets = sets.map((s, i) => {
        if (i === index) {
            return { ...s, [field]: value };
        }
        return s;
    });
    setSets(newSets);
  };

  const handleBodyweightToggle = (isBW: boolean) => {
    setBodyweightReps(isBW);
    setSets(sets.map(set => ({
      ...set,
      weight: isBW ? 'BW' : '', // Reset weight field or set to BW
      // reps: isBW ? '' : set.reps // Original logic, decide if reps should also reset
    })));
  };

  return (
    <div className={styles.container}>
        <button className={styles.deleteButton} onClick={onDelete} aria-label="Delete Exercise">
        </button>

      <div className={styles.formBox}>
        <label htmlFor={`exerciseName-${React.useId()}`}>Exercise Name: </label>
        <input
          type="text"
          id={`exerciseName-${React.useId()}`}
          className={styles.input}
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          placeholder="Enter exercise name"
        />

        <div className={styles.toggleContainer}>
          <label htmlFor={`bodyweightReps-${React.useId()}`}>Body Weight Reps</label>
          <input
            type="checkbox"
            id={`bodyweightReps-${React.useId()}`}
            checked={bodyweightReps}
            onChange={(e) => handleBodyweightToggle(e.target.checked)}
            className={styles.switchInput} // For custom styling if needed
          />
        </div>

        <div className={styles.toggleContainer}>
          <label htmlFor={`lbsToggle-${React.useId()}`}>{lbs ? 'Weight in Lbs' : 'Weight in Kg'}</label>
          <input
            type="checkbox"
            id={`lbsToggle-${React.useId()}`}
            checked={lbs}
            onChange={(e) => setLbs(e.target.checked)}
            className={styles.switchInput}
          />
        </div>

        <p>Muscle Groups:</p>
        <div className={styles.muscleGroupContainer}>
          {muscleGroupOptions.map(group => (
            <button
              key={group}
              type="button" // Important for buttons in forms not to submit by default
              className={`${styles.muscleGroupButton} ${muscleGroups.includes(group) ? styles.selectedMuscleGroup : ''}`}
              onClick={() => handleMuscleGroupChange(group)}
            >
              {group}
            </button>
          ))}
        </div>

        <p>Sets and Reps:</p>
        {sets.map((set, index) => (
          <div key={index} className={styles.setRow}>
            {/* setTypeContainer was empty, can be omitted or used for set type dropdown later */}
            <input
              className={styles.setInput}
              value={set.weight}
              onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
              placeholder={lbs ? "Weight (lbs)" : "Weight (kg)"}
              type={bodyweightReps ? "text" : "number"} // Use text for "BW", number otherwise
              readOnly={bodyweightReps && set.weight === 'BW'} // Make BW field read-only
              min={bodyweightReps ? undefined : "0"} // Min value for numeric input
              step={bodyweightReps ? undefined : "0.1"} // Allow decimals for weight
            />
            <input
              className={styles.setInput}
              value={set.reps}
              onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
              placeholder="Reps"
              type="number"
              min="0"
            />
            {/* Optionally, add a button to remove a specific set */}
            {/* <button onClick={() => handleRemoveSet(index)}>Remove</button> */}
          </div>
        ))}

        <button type="button" onClick={handleAddSet} className={styles.addSetButton}>
          Add Set
        </button>
      </div>
    </div>
  );
};
// Parent component (NewWorkout)
const NewWorkout: FC<NewWorkoutProps> = () => {
 const [exerciseCount, setExerciseCount] = useState(1); // Start with one exercise
 const [showStopwatch, setShowStopwatch] = useState(false);
 const [isWorkoutVisible, setIsWorkoutVisible] = useState(false);

  const addExercise = () => {
    setExerciseCount(prevCount => prevCount + 1);
  };

 const deleteExercise = () => {
 setExerciseCount(prevCount => Math.max(1, prevCount - 1)); // Ensure at least one exercise
 };

 const handleNewWorkoutClick = () => {
 setShowStopwatch(true);
 setIsWorkoutVisible(true);
  };

  return (
    <div>
      <button onClick={handleNewWorkoutClick}>New Workout</button>
      {isWorkoutVisible && (
        <div>
          {[...Array(exerciseCount)].map((_, index) => (<AddExercise key={index} onDelete={deleteExercise} />))}      <button onClick={addExercise}>add exercise</button>{exerciseCount > 1 && <button onClick={deleteExercise}>remove exercise</button>}
        </div>
      )}
    </div>
  );
};
export default NewWorkout;