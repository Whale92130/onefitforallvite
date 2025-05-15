// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
//import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // Your global styles
import { FirebaseProvider } from './FirebaseContext';
import { ThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseProvider>
    <ThemeProvider>
   
      <App />

    </ThemeProvider>
    </FirebaseProvider>
  </React.StrictMode>,
);