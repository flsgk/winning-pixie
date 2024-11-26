// src/firebase.js
import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Firebase 인증 객체 가져오기
