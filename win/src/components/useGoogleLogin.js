import React, { useState } from "react";
import { signInWithGoogle } from "../auth";
import { database, googleProvider } from "../firebase";
import { ref, get, set } from "firebase/database";

const useGoogleLogin = (onSuccess) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      // google 로그인 처리
      const result = await signInWithGoogle();
      console.log(result); // result 확인하기
      const user = result.user; // user 객체가 제대로 반환되었는지 확인

      // 사용자 데이터 확인 후, 추가 정보 입력 페이지로 이동
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      // 이미 사용자 정보가 있으면 메시지 표시 후 종료
      if (snapshot.exists()) {
        setMessage("이미 Google 계정으로 가입된 사용자입니다.");
        setLoading(false);
        onSuccess("/"); // 기존 사용자면 홈 화면으로 이동
        return;
      }

      // 신규 사용자라면 추가 정보 저장
      await set(userRef, {
        email: user.email,
        nickname: "", // 추가 정보 입력 대기
        fullname: user.displayName || "Anonymous",
        createdAt: new Date().toISOString(),
        selectedTeam: "null", // 팀 선택 정보 대기
      });

      setMessage("Google 로그인 성공. 추가 정보를 입력해주세요.");
      setLoading(false);
      onSuccess("/my-page"); // 신규 사용자면 My Page로 이동
    } catch (error) {
      setMessage(`Google 로그인 실패: ${error.message}`);
      setLoading(false);
    }
  };

  return {
    message,
    loading,
    handleGoogleLogin,
  };
};

export default useGoogleLogin;
