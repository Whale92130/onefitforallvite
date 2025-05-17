import { useEffect, useState } from "react";
import { app } from "./firebase";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";

const auth = getAuth(app);

// Persistence setup (run once)
(async () => {
  try {
    const isWeb = typeof window !== "undefined" && typeof window.document !== "undefined";
    const persistence = isWeb ? browserLocalPersistence : inMemoryPersistence;
    await setPersistence(auth, persistence);
    console.log("Firebase persistence set.");
  } catch (error: any) {
    if (error.code === "auth/already-initialized") {
      console.log("Firebase persistence already initialized.");
    } else {
      console.error("Error setting Firebase persistence:", error);
    }
  }
})();

const useFirebase = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  // Track user state reactively
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const signinWithGoogle = async () => {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const signInEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const createEmailAccount = async (email: string, username: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    return userCredential.user;
  };

  const signout = async () => {
    await signOut(auth);
  };

  return { user, signinWithGoogle, signInEmail, createEmailAccount, signout };
};

export default useFirebase;
