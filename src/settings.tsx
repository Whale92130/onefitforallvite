// src/SettingsPage.tsx
import { CSSProperties, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import useFirebase from "./useFirebase";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useTheme } from "./ThemeContext";
import { ThemeName } from "./colors";
import SignInPage from "./signInPage";

const SettingsPage = () => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const [showAbout, setShowAbout] = useState(false);
  const { signout } = useFirebase();

  const { theme, setTheme, themeName } = useTheme();
  const [loading, setLoading] = useState(true);

  // inline styles just for demo
  const btnStyle: CSSProperties = {
    margin: 8,
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  };

  // 1) Load saved theme on mount
  useEffect(() => {
    if (!user) return;

    (async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.theme && typeof data.theme === "string") {
          setTheme(data.theme as ThemeName);
        }
      }

      setLoading(false);
    })();
  }, [user, db, setTheme]);

  // 2) When themeName changes, save to Firestore
  useEffect(() => {
    if (!user || loading) return;

    const save = async () => {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          theme: themeName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }  // only updates these fields
      );
    };
    save();
  }, [user, db, themeName, loading]);

  const handleSignOut = () => {
    if (signout) { // Good practice to check if signout exists
      signout();
    } else {
      console.error("Firebase signout function is not available.");
    }
  };
  const handleAboutClick = () => {
    setShowAbout(!showAbout);
  };

  if (!user) return <>
    <p style={{ textAlign: 'center', padding: 20, background: theme.background, color: theme.textPrimary }}>Please sign in to change your settings.</p>
    <SignInPage />
  </>;
  if (loading) return <p>Loading your settings…</p>;

  return (
    <div style={{ padding: 20, background: theme.background, color: theme.textPrimary }}>
      <h1>Settings</h1>
      <h2> Current Theme: {themeName} </h2>

      {(["light",
        "dark",
        "winter",
        "CCA",
        "spring",
        "autumn",
        "summer",
        "mrhare",
        "nether",
        "midnight",
        "america",
        "enderpearl"] as ThemeName[]
      ).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          disabled={themeName === t}
          style={{
            ...btnStyle,
            background: theme.button,
            color: theme.textSecondary,
            opacity: themeName === t ? 0.6 : 1,
          }}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)} Theme
        </button>
      ))}
      <br />
      <br />
      <br />
      <button style={{ background: theme.button, color: theme.textSecondary, margin: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleAboutClick}>
        {showAbout ? "Hide" : "Show"} About 1Fit4All
      </button>

      
      


      {showAbout && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: theme.secondary, color: theme.textSecondary, borderRadius: '20px' }}>
          <p>
            At Good Boy Inc., we’re more than just developers — we’re a team brought together by a shared mission: to help people feel stronger, happier, and healthier every single day.
          </p>
          {/* ... rest of your about text ... */}
          <p>
            Stay strong. Stay good.
            — The Good Boy Inc. Team.
          </p>
        </div>
      )}
      <br />
      <button style={{
        ...btnStyle,
        background: theme.button,
        color: theme.textSecondary
      }} onClick={() => handleSignOut()}>Sign Out</button>
    </div>
  );
};

export default SettingsPage;
