import { useState, useEffect } from 'react';

export function useStorageState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to hold our value
  // Pass initial state function to useState so logic is only executed once
  const [state, setState] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // useEffect to update local storage when the state changes
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
