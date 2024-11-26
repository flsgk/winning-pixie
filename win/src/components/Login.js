import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const auth = getAuth(); // Firebase 인증 객체 가져오기

    try {
      await signInWithEmailAndPassword(auth, email, password); //signInWithEmailAndPassword 함수로 로그인하기
      setMessage("로그인 성공!");
      navigate("/");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <div>
        <label>이메일 </label>
        <input
          type="email"
          placeholder="이메일 계정을 입력하세요."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
      </div>
      <div>
        <label>비밀번호 </label>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
      </div>
      <button onClick={handleLogin}>로그인하기</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
