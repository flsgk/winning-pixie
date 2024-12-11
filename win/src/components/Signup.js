import React from "react";
import { useNavigate } from "react-router-dom";
import useSignupForm from "./useSignupForm";

function Signup() {
  const navigate = useNavigate();

  // 커스텀 훅 사용
  const {
    formData,
    message,
    loading,
    handleChange,
    handleSignup,
    handleKeyDown,
  } = useSignupForm(() => navigate("/select-team")); // 성공 시 팀 선택 화면으로 이동

  return (
    <div>
      <h2>회원가입</h2>
      {message && <p>{message}</p>}

      <form>
        <div>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="nickname"
            placeholder="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="fullname"
            placeholder="이름"
            value={formData.fullname}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
          />
        </div>

        <button type="button" onClick={handleSignup} disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
