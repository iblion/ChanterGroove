import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

// ─── Firebase Config ──────────────────────────────────────────────────────
// These values come from .env — when empty/placeholder, Firebase is disabled.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  databaseURL: process.env.FIREBASE_DATABASE_URL || '',
};

// Only initialize Firebase if real credentials are provided
const hasValidConfig = firebaseConfig.apiKey.length > 10 && firebaseConfig.projectId.length > 3;

let app: FirebaseApp | null = null;
let rtdb: Database | null = null;
let auth: any = null;
let db: any = null;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    rtdb = getDatabase(app);
    // Auth and Firestore can be initialized when needed
  } catch (e) {
    console.warn('[ChanterGroove] Firebase init skipped — invalid config');
  }
} else {
  console.log('[ChanterGroove] Firebase disabled — no API keys in .env');
}

export { auth, db, rtdb };
export default app;
