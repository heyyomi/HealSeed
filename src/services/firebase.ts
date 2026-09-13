import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDMZ1zNKmQm7rzWmMeU4r3WqX3wn0nFMXU",
  authDomain: "ordinaryday-5cd21.firebaseapp.com",
  projectId: "ordinaryday-5cd21",
  storageBucket: "ordinaryday-5cd21.firebasestorage.app",
  messagingSenderId: "746944151296",
  appId: "1:746944151296:web:3b7a6763f14adaafeffde5"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
