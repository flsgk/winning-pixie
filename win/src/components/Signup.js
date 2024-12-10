import React, { useState } from "react";
import { auth, database } from "../firebase"; // Firebase 설정 가져오기
import { createUserWithEmailAndPassword } from "firebase/auth";
//createUserWithEmailAndPassword 는 비동기 함수
import { useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const [fullname, setFullname] = useState("");
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 1. firebase auth로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Realtime Database에 사용자 추가 정보 저장
      await set(ref(database, `users/${user.uid}`), {
        email: email,
        nickname: nickname,
        fullname: fullname,
        createdAt: new Date().toISOString(),
      });

      setMessage("Welcome! 회원가입 성공!");
      navigate("/select-team"); // 로그인 성공 후 팀 선택 화면으로 이동
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <div>
          <input
            type="text"
            placeholder="회원명을 입력해주세요."
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="닉네임을 입력해주세요."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="이메일 주소를 입력해주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            type="password"
            placeholder="6자리 이상의 비밀번호를 설정해주세요."
            value={password}
            min="6"
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <button type="submit">시작하기</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;
