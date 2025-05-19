// src/YourNextWorkout.tsx
import { useState, useEffect, CSSProperties, FC } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

const YourNextWorkout: FC = () => {
  const { theme } = useTheme();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);

  // 1) Fetch all workout names
  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return;
      const col = collection(db, 'users', user.uid, 'workouts');
      const snap = await getDocs(col);
      setSavedNames(snap.docs.map(d => d.id));
    };
    fetchSaved();
  }, [user, db]);

  // 2) Pick up to 4 at random whenever savedNames changes
  useEffect(() => {
    if (savedNames.length === 0) {
      setSlots([null, null, null, null]);
      return;
    }
    const shuffled = [...savedNames].sort(() => Math.random() - 0.5);
    const picked: (string | null)[] = shuffled.slice(0, 4);
    while (picked.length < 4) picked.push(null);
    setSlots(picked);
  }, [savedNames]);

  // Styles
  const styles: { [k: string]: CSSProperties } = {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.primary,
      borderRadius: 10,
      padding: 10,
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexShrink: 0,
    },
    title: {
      fontSize: 18,
      color: theme.textPrimary,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingBottom: 0,
    },
    buttonContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      width: '100%',
    },
    button: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.button,
      borderRadius: 5,
      marginBottom: 8,
      padding: '12px 10px',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'center',
      flexGrow: 1,
      flexBasis: 'auto',
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: 500,
      WebkitTapHighlightColor: 'transparent',
    },
    placeholder: {
      backgroundColor: theme.background,
      color: theme.textPrimary,
      opacity: 0.7,
      cursor: 'default',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Next Workout</h2>
      </div>

      <div style={styles.buttonContainer}>
        {slots.map((name, idx) => (
          <button
            key={idx}
            type="button"
            style={{
              ...styles.button,
              ...(name === null ? styles.placeholder : {}),
            }}
            onClick={() => {
              if (name) navigate('/newWorkout', { state: { workoutName: name } }); // Pass workout name as state
            }}
            disabled={name === null}
          >
            {name ?? '—'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YourNextWorkout;
