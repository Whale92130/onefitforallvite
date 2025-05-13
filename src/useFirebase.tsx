import app from "./firebase";
import { browserLocalPersistence, createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";


const auth = getAuth(app);

// Set persistence strategy once on initialization
(async () => {
    try {
        const isTrulyWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

        if (isTrulyWeb) { // More direct check for web environment
            await setPersistence(auth, browserLocalPersistence);
            console.log("Firebase auth persistence set to: browserLocalPersistence (web)");
        } else {
            // This branch would be for non-web (e.g., React Native native)
            await setPersistence(auth, inMemoryPersistence);
        }
    } catch (error: any) {
        // This error can occur if a user is already signed in (e.g., session restored)
        // as setPersistence cannot be called when a user is authenticated.
        // In such cases, the existing persistence mechanism is already in effect.
        if (error.code === 'auth/already-initialized') {
            console.log("Firebase auth persistence was already initialized.");
        } else {
            console.error("Failed to set Firebase auth persistence on initial load:", error);
        }
    }
})();

const useFirebase = () => {
    const signinWithGoogle = async () => {
        if (auth.currentUser) {
            console.log("Already signed in, returning current user");
            return auth.currentUser;
        }

        try {
            console.log("Starting Google sign-in process");

            // Persistence is now set globally on initialization

            const provider = new GoogleAuthProvider();

            console.log("Opening sign-in popup");
            const result = await signInWithPopup(auth, provider);
            console.log("Sign-in popup completed");

            const user = result.user;
            console.log("Got user from sign-in result", user.uid);

            


            return user; // Return the user to indicate successful sign-in
        } catch (error) {
            console.error("Google sign-in error:", error);
            throw error; // Propagate the error to be handled by the caller
        }
    };


    const signInEmail = async (email: string, password: string) => {
        try {
            console.log("Starting email sign-in for:", email);

            // Persistence is now set globally on initialization

            console.log("Attempting email sign-in");
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            return userCredential.user; // Return the user to indicate successful sign-in
        } catch (error) {
            console.error("Email sign-in error:", error);
            throw error; // Propagate the error to be handled by the caller
        }
    };

    const createEmailAccount = async (email: string, username: string, password: string) => {
        // Persistence is now set globally on initialization
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        return userCredential.user;
    };

    const signout = async () => {
        await auth.signOut();
    };

    return { signinWithGoogle, signInEmail, createEmailAccount, signout };
};

export default useFirebase;
