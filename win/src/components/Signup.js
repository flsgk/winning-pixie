import React, { useState } from "react";
import { auth } from "../firebase"; // Firebase 설정 가져오기
import { createUserWithEmailAndPassword } from "firebase/auth";
//createUserWithEmailAndPassword 는 비동기 함수
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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
          {" "}
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
