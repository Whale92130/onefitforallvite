import { createContext, useEffect, useState } from "react";
import {
  getAuth,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);

export const FirebaseContext = createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}>({
  user: null,
  setUser: () => {},
});

type Props = { children: React.ReactNode };

export const FirebaseProvider: React.FC<Props> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);



  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("Auth state changed", user ? "user exists" : "no user");
        setUser(user);
        setInitializing(false);

        // If user exists but no token, try to get it

      },
      (error) => {
        console.error("Auth state change error:", error);
        setAuthError(error.message);
        setInitializing(false);
      }
    );

    // Force initializing to false after 3 seconds as a failsafe
    const timeout = setTimeout(() => {
      if (initializing) {
        console.log("Auth initialization timeout - forcing completion");
        setInitializing(false);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (initializing) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    );
  }

  if (authError) {
    return (
      <div style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "red" }}>Authentication Error: {authError}</p>
        <p>Please restart the app and try again.</p>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider
      value={{ user, setUser }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
