// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzOUS92pFB8ZbyKptV92iYWTdJB3F_TmA",
  authDomain: "fit4all-38b90.firebaseapp.com",
  projectId: "fit4all-38b90",
  storageBucket: "fit4all-38b90.firebasestorage.app",
  messagingSenderId: "702464740929",
  appId: "1:702464740929:web:ce7e290ac0300a586700c0",
  measurementId: "G-FZG8CJF60W"
};

const app = initializeApp(firebaseConfig);
export default app;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
