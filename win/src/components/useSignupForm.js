import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { equalTo, orderByChild, query, ref, get, set } from "firebase/database";
import React, { useState } from "react";
import { auth, database } from "../firebase";

const useSignupForm = (onSuccess) => {
  const [formData, setFormData] = useState({
    email: "",
    nickname: "",
    fullname: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 입력 필드 핸들러 (회원가입 화면에 입력한 데이터를 저장하는 함수)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 유효성 검사
  const validateForm = () => {
    const { email, nickname, fullname, password, confirmPassword } = formData;

    if (!email || !nickname || !fullname || !password) {
      setMessage("모든 필드를 입력해주세요.");
      return false;
    }

    if (password.length < 6) {
      setMessage("비밀번호는 6자 이상이어야 합니다.");
      return false;
    }
    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  // 회원가입 함수
  const handleSignup = async () => {
    if (!validateForm()) return; // 유효성 검사가 실패하면 회원가입 함수가 종료된다.

    setLoading(true);
    const { email, nickname, fullname, password } = formData;

    try {
      // 이메일 중복 체크
      const checkExist = await fetchSignInMethodsForEmail(auth, email);
      if (checkExist.length > 0) {
        setMessage("이미 사용 중인 이메일입니다.");
        setLoading(false);
        return;
      }

      // 닉네임 중복 체크
      const nicknameQuery = query(
        ref(database, "users"),
        orderByChild("nickname"),
        equalTo(nickname)
      );

      const snapshot = await get(nicknameQuery);
      if (snapshot.exists()) {
        setMessage("이미 사용 중인 닉네임입니다.");
        setLoading(false);
        return;
      }

      // 이메일, 닉네임 중복 체크되면 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Realtime Database에 추가 정보 저장
      await set(ref(database, `users/${user.uid}`), {
        email,
        nickname,
        fullname,
        createdAt: new Date().toISOString(),
        selectedTeam: null,
      });

      setMessage("회원가입 성공");
      setLoading(false);
      if (onSuccess) onSuccess(); // 회원가입 성공 시 콜백 함수 실행
    } catch (error) {
      setMessage(`회원가입 실패:${error.message}`);
      setLoading(false);
    }
  };

  // 엔터 키 동작 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return {
    formData,
    message,
    loading,
    handleChange,
    handleSignup,
    handleKeyDown,
  };
};

export default useSignupForm;
