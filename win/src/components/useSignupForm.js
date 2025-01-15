import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { equalTo, orderByChild, query, ref, get, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { auth, database } from "../firebase";

const useSignupForm = (onSuccess) => {
  const [formData, setFormData] = useState({
    email: "",
    nickname: "",
    fullname: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({}); // 각 필드의 에러 상태를 객체로 관리
  const [loading, setLoading] = useState(false);

  // 입력 필드 핸들러 (회원가입 화면에 입력한 데이터를 저장하는 함수)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // 유효성 검사
  const validateForm = () => {
    const { email, nickname, fullname, password, confirmPassword } = formData;
    const newErrors = {};

    if (!email || !nickname || !fullname || !password || !confirmPassword) {
      newErrors.allField = "모든 필드를 입력해주세요.";
    }

    if (!email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    if (!nickname) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    }

    if (!fullname) {
      newErrors.fullname = "이름을 입력해주세요.";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);

    // 오류가 없으면 true 반환
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailDuplicate = async (email) => {
    // Realtime Database에서 이메일 중복 확인
    const emailQuery = query(
      ref(database, "users"), // users 경로를 쿼리합니다.
      orderByChild("email"), // 이메일 필드 기준으로 정렬
      equalTo(email) // 입력된 이메일과 동일한 값을 찾습니다.
    );

    try {
      const snapshot = await get(emailQuery);
      if (snapshot.exists()) {
        return true; // 이메일이 이미 존재
      } else {
        return false; // 이메일이 존재하지 않음
      }
    } catch (error) {
      console.error("이메일 중복 확인 실패:", error);
      return false; // 에러 발생 시 중복이 아니라고 판단
    }
  };

  // 회원가입 함수
  const handleSignup = async () => {
    if (!validateForm()) return; // 유효성 검사가 실패하면 회원가입 함수가 종료된다.

    setLoading(true);
    const { email, nickname, fullname, password } = formData;

    try {
      // 닉네임 중복 체크
      const nicknameQuery = query(
        ref(database, "users"),
        orderByChild("nickname"),
        equalTo(nickname)
      );

      const snapshot = await get(nicknameQuery);
      if (snapshot.exists()) {
        setErrors((prev) => ({
          ...prev,
          nickname: "이미 사용 중인 닉네임입니다.",
        }));
        setLoading(false);
        return;
      }

      // 이메일 중복 체크
      const isEmailDuplicate = await checkEmailDuplicate(email);
      if (isEmailDuplicate) {
        setErrors((prev) => ({
          ...prev,
          email: "이미 사용 중인 이메일입니다.",
        }));
        setLoading(false);
        return;
      }

      // 이메일, 닉네임 중복 체크되면 사용자 생성
      console.log("Signing up with:", email, password);
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

      setLoading(false);
      if (onSuccess) onSuccess(); // 회원가입 성공 시 콜백 함수 실행
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: `회원가입 실패: ${error.message}`,
      })); // 서버 등 예상하지 못한 오류는 .general에 저장
      setLoading(false);
    }
  };

  // 이메일 중복 체크 후 errors 상태가 갱신되었을 때 실행할 작업을 useEffect로 처리
  useEffect(() => {
    if (errors.email) {
      console.log("Updated errors:", errors.email); // 이메일 에러가 변경될 때마다 로그 출력
    }
  }, [errors.email]); // errors.email 값이 변경될 때마다 실행됨

  // 엔터 키 동작 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSignup,
    handleKeyDown,
  };
};

export default useSignupForm;
