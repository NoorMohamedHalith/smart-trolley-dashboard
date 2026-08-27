import { initializeApp, getApps, deleteApp } from "firebase/app";

import {
  getDatabase,
  ref,
  onValue,
  off,
  push,
  set,
  remove,
  get,
  child
} from "firebase/database";

// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyBZL36JVOOZ_nq8mMK2QC2srmw8Lg6BszM",
  authDomain: "smart-trolley-4c491.firebaseapp.com",
  databaseURL: "https://smart-trolley-4c491-default-rtdb.firebaseio.com",
  projectId: "smart-trolley-4c491",
  storageBucket: "smart-trolley-4c491.firebasestorage.app",
  messagingSenderId: "608630291185",
  appId: "1:608630291185:web:8187a64d26ce6a0ce3c750"
};

// =====================================================
// GET ACTIVE FIREBASE CONFIG
// =====================================================

export const getActiveFirebaseConfig = () => {

  const storedConfig =
    localStorage.getItem("smart_trolley_firebase_config");

  if (storedConfig) {

    try {

      const parsed = JSON.parse(storedConfig);

      if (
        parsed.databaseURL &&
        parsed.apiKey
      ) {
        return parsed;
      }

    } catch (error) {

      console.error(
        "Invalid custom Firebase config:",
        error
      );
    }
  }

  return firebaseConfig;
};

// =====================================================
// FIREBASE CONFIGURED CHECK
// =====================================================

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL
);

// =====================================================
// FIREBASE INITIALIZATION
// =====================================================

let app = null;
let database = null;

export const initFirebase = (config) => {

  const targetConfig =
    config || getActiveFirebaseConfig();

  try {

    const currentApps = getApps();

    // Remove existing app if present
    if (currentApps.length > 0) {

      try {
        deleteApp(currentApps[0]);
      } catch (error) {
        console.warn(
          "Could not delete previous Firebase app:",
          error
        );
      }
    }

    if (
      targetConfig.apiKey &&
      targetConfig.databaseURL
    ) {

      app = initializeApp(targetConfig);

      database = getDatabase(app);

      console.log(
        "Firebase initialized successfully"
      );

      return {
        app,
        database,
        success: true
      };
    }

  } catch (error) {

    console.error(
      "[Firebase Initialization Error]:",
      error
    );
  }

  return {
    app: null,
    database: null,
    success: false
  };
};

// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const initialRes =
  initFirebase(firebaseConfig);

app = initialRes.app;
database = initialRes.database;

// =====================================================
// SAVE CUSTOM FIREBASE CONFIG
// =====================================================

export const saveCustomFirebaseConfig = (config) => {

  localStorage.setItem(
    "smart_trolley_firebase_config",
    JSON.stringify(config)
  );

  return initFirebase(config);
};

// =====================================================
// CLEAR CUSTOM FIREBASE CONFIG
// =====================================================

export const clearCustomFirebaseConfig = () => {

  localStorage.removeItem(
    "smart_trolley_firebase_config"
  );

  return initFirebase(firebaseConfig);
};

// =====================================================
// EXPORTS
// =====================================================

export {
  app,
  database,
  ref,
  onValue,
  off,
  push,
  set,
  remove,
  get,
  child
};