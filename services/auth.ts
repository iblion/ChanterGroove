import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import app from './firebase';

// ─── Guest-First Auth Service ──────────────────────────────────────────────
// Users play immediately without signing in.
// An anonymous Firebase user is created silently behind the scenes.

let currentUser: User | null = null;
let authReady = false;
let authReadyPromise: Promise<User | null> | null = null;

function getAuthInstance() {
  if (!app) return null;
  try {
    return getAuth(app);
  } catch {
    return null;
  }
}

/**
 * Ensures a user is signed in (anonymously).
 * Returns the Firebase User or null if Firebase is not configured.
 * This is invisible to the user — no login screen.
 */
export async function ensureUser(): Promise<User | null> {
  const auth = getAuthInstance();
  if (!auth) return null;

  // If already resolved, return cached
  if (authReady) return currentUser;

  // If already loading, return the same promise
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        currentUser = user;
        authReady = true;
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          currentUser = cred.user;
          authReady = true;
          resolve(cred.user);
        } catch (e) {
          console.warn('[auth] Anonymous sign-in failed:', e);
          authReady = true;
          resolve(null);
        }
      }
    });
  });

  return authReadyPromise;
}

/**
 * Get the current user UID, or a fallback local ID.
 */
export function getUserId(): string {
  return currentUser?.uid || `local_${Date.now()}`;
}

/**
 * Check if the current user is anonymous (guest).
 */
export function isAnonymous(): boolean {
  return currentUser?.isAnonymous ?? true;
}

/**
 * Get the current Firebase User or null.
 */
export function getCurrentUser(): User | null {
  return currentUser;
}
