import { signOut } from "firebase/auth";
import React from "react";
import { auth } from "../firebase";

function Logout({ onLogout }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃되었습니다.");
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생 :", error);
    }
  };
  return <button onClick={handleLogout}>로그아웃</button>;
}

export default Logout;
