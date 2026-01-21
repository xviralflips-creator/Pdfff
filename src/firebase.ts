import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC4F3bwejIEVJE8wdFQ_OCm2wVE67W0bUk",
  authDomain: "ai-digi-studio.firebaseapp.com",
  projectId: "ai-digi-studio",
  storageBucket: "ai-digi-studio.firebasestorage.app",
  messagingSenderId: "618653526550",
  appId: "1:618653526550:web:5ee73dcaa2899ea5d6a337",
  measurementId: "G-58ZZTT0JTB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;