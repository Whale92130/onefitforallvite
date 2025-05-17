import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  FC,
  useContext,
} from "react";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

interface FirebaseCtx {
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseCtx>({
  user: null,
  loading: true,
});

export const FirebaseProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setLoading(false);
      },
      (err) => {
        console.error("Auth state change error:", err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // While Firebase is initializing, show a loader
  if (loading) {
    return <div style={{ padding: 20 }}>Loading authentication…</div>;
  }

  return (
    <FirebaseContext.Provider value={{ user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebaseContext = () => useContext(FirebaseContext);
