// ============================================
// Firebase Configuration — ProfitLens
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtDQ91Qw9gF5Gh4v_gU1rWZlieRrIh7tk",
  authDomain: "recoverx-16a59.firebaseapp.com",
  projectId: "recoverx-16a59",
  storageBucket: "recoverx-16a59.firebasestorage.app",
  messagingSenderId: "440891088300",
  appId: "1:440891088300:web:8340e5ee53aae0e809ae09",
  measurementId: "G-41G715BTNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
