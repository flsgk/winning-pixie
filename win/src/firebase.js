// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Realtime Database 추가
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApOnSAWpRpxx1k9EkGeFO0a4vZhFOjOpQ",
  authDomain: "react-test-72b8a.firebaseapp.com",
  databaseURL: "https://react-test-72b8a-default-rtdb.firebaseio.com",
  projectId: "react-test-72b8a",
  storageBucket: "react-test-72b8a.firebasestorage.app",
  messagingSenderId: "394585580991",
  appId: "1:394585580991:web:7f81389710f6a96280ed0a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
