import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const FIRESTORE_DATABASE_ID = "ai-studio-android-ortodoxt-978cc305-7d2a-4a20-81c0-3f71d9ab1ae5";

/**
 * Initialize Cloud Firestore using the exact database ID for Android + Web
 * CRITICAL: The app must explicitly specify the database ID
 */
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Export app and configuration values for usage across components
export { app, firebaseConfig };

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
