import { signOut } from "firebase/auth";
import React from "react";
import { auth } from "../firebase";
import Button from "@mui/joy/Button";

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
  return (
    <Button
      color="neutral"
      variant="soft"
      sx={{
        borderRadius: 10,
        width: "100px",
      }}
      onClick={handleLogout}
    >
      로그아웃
    </Button>
  );
}

export default Logout;
