// src/components/Stopwatch.tsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './Stopwatch.module.css'; // We'll create this CSS module

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  // const [isRunning, setIsRunning] = useState(false); // Not strictly needed for auto-start without controls
  const intervalRef = useRef<number | null>(null); // Use `number` for browser interval ID

  useEffect(() => {
    // setIsRunning(true); // Set if you had controls and wanted to reflect state

    // Start the interval when the component mounts
    intervalRef.current = window.setInterval(() => {
      setTime((prevTime) => prevTime + 1000); // Increment by 1000 milliseconds (1 second)
    }, 1000);

    // Clear the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array: effect runs once on mount and cleans up on unmount

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`; // padStart was already on individual parts
  };

  return (
    <div className={styles.container}>
      <p className={styles.time}>{formatTime(time)}</p>
    </div>
  );
};

export default Stopwatch;