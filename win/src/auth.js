// src/auth.js

import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("구글 로그인 실패:", error);
    throw error;
  }
};
