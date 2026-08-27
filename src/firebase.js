import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, push, set, remove, get, child } from 'firebase/database';

// Helper to get active config from localStorage or import.meta.env
export const getActiveFirebaseConfig = () => {
  const storedConfig = localStorage.getItem('smart_trolley_firebase_config');
  if (storedConfig) {
    try {
      const parsed = JSON.parse(storedConfig);
      if (parsed.databaseURL && parsed.apiKey) {
        return parsed;
      }
    } catch (e) {
      console.error('Invalid custom Firebase config in localStorage:', e);
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
};

const firebaseConfig = getActiveFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  !firebaseConfig.apiKey.includes('YourApiKeyHere') &&
  !firebaseConfig.apiKey.includes('DemoKeyForSmartRFID')
);

let app;
let database;

export const initFirebase = (config) => {
  const targetConfig = config || getActiveFirebaseConfig();
  try {
    const currentApps = getApps();
    if (currentApps.length > 0) {
      deleteApp(currentApps[0]);
    }
    if (targetConfig.apiKey && targetConfig.databaseURL) {
      app = initializeApp(targetConfig);
      database = getDatabase(app);
      return { app, database, success: true };
    }
  } catch (error) {
    console.error('[Firebase Initialization Error]:', error);
  }
  return { app: null, database: null, success: false };
};

const initialRes = initFirebase(firebaseConfig);
app = initialRes.app;
database = initialRes.database;

export const saveCustomFirebaseConfig = (config) => {
  localStorage.setItem('smart_trolley_firebase_config', JSON.stringify(config));
  return initFirebase(config);
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem('smart_trolley_firebase_config');
  return initFirebase(getActiveFirebaseConfig());
};

export { app, database, ref, onValue, off, push, set, remove, get, child };
