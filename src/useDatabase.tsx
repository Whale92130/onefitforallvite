// useDatabase.ts
import { useCallback } from "react";
import { getDatabase, ref, set, get, Database } from "firebase/database";
import { app } from "./firebase";

export function useDatabase() {
  const db: Database = getDatabase(app);

  const saveUserData = useCallback(
    async (userId: string, data: Record<string, any>) => {
      try {
        await set(ref(db, `users/${userId}`), data);
        console.log("User data saved!");
      } catch (err) {
        console.error("Error saving user data:", err);
      }
    },
    [db]
  );

  const getUserData = useCallback(
    async (userId: string) => {
      try {
        const snap = await get(ref(db, `users/${userId}`));
        return snap.exists() ? snap.val() : null;
      } catch (err) {
        console.error("Error getting user data:", err);
        return null;
      }
    },
    [db]
  );

  return { db, saveUserData, getUserData };
}
