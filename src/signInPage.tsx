// src/SignInPage.tsx
import React, { useState } from 'react';
import useFirebase from './useFirebase';
import { useTheme } from './ThemeContext';

const SignInPage: React.FC = () => {

  const [error,setError] = useState<string | null>(null);
  const [loading,setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  loading;
  error;

  const { signinWithGoogle, signInEmail, createEmailAccount } = useFirebase();

  const signInWithGoogle1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signinWithGoogle();
      // You could redirect here with useNavigate() if using react-router
      window.location.reload();
      // alert('Signed in successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInEmail(email, password);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createEmailAccount(email, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  const {theme} = useTheme();
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      height: '100vh',
      flexDirection: "column",
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 30,
      borderRadius: 8,
      backgroundColor: theme.background,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      width: 300,
    },
    input: {
      padding: 10,
      fontSize: 16,
      borderRadius: 4,
      border: '1px solid #ccc',
      color: theme.textPrimary,
      backgroundColor: theme.background,
    },
    button: {
      padding: 10,
      fontSize: 16,
      borderRadius: 4,
      border: 'none',
      backgroundColor: theme.primary,
      color: theme.textPrimary,
      cursor: 'pointer',
    },
    error: {
      color: 'red',
      fontSize: 14,
      textAlign: "center",
      width: "100%",
      display: "flex",
      justifyContent: "center"
    },
    spreadButtons: {
      display: "flex",
      justifyContent: "space-evenly"
    },
    label: {
      color: theme.textPrimary
    }
  };
  

  return (
    <div style={styles.container}>
      

        <div style={styles.form}>
        <label style={styles.label}>Email</label>
        <input value={email} onChange={(e)=>{setEmail(e.target.value)}} style={styles.input}/><br />
        <label style={styles.label}>Password</label>
        <input value={password} onChange={(e)=>{setPassword(e.target.value)}} type="password" style={styles.input}/><br />

        {error && <div style={styles.error}><span>{error}</span></div>}
        <div style={styles.spreadButtons}>
          <button onClick={signUp} style={styles.button}>Sign Up</button>
          <button onClick={signIn} style={styles.button}>Sign In</button>
        </div>
        </div>
        <label style={styles.label}>OR</label>
        <br></br>
        <button onClick={signInWithGoogle1} style={styles.button}>Sign in with Google</button>
    </div>
  );
};

export default SignInPage;

// --- Basic inline styles ---
