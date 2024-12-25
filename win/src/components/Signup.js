import React from "react";
import { useNavigate } from "react-router-dom";
import useSignupForm from "./useSignupForm";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2, // 요소 간 간격
        textAlign: "center",
      }}
    >
      <Typography component="h1" level="h3">
        회원가입
      </Typography>

      <Box sx={{ width: "300px" }}>
        <FormLabel sx={{ fontSize: "0.8rem" }}>이름(실명)</FormLabel>
        <Input
          type="text"
          name="fullname"
          placeholder="이름을 입력하세요."
          value={formData.fullname}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          sx={{ width: "100%", mb: 2 }}
          required
        />
        <FormLabel sx={{ fontSize: "0.8rem" }}>닉네임</FormLabel>
        <Input
          type="text"
          name="nickname"
          placeholder="닉네임을 입력하세요."
          value={formData.nickname}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          sx={{ width: "100%", mb: 2 }}
          required
        />
        <FormLabel sx={{ fontSize: "0.8rem" }}>이메일 계정</FormLabel>
        <Input
          type="email"
          name="email"
          placeholder="이메일 계정을 입력하세요."
          value={formData.email}
          onChange={handleChange}
          onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
          sx={{ width: "100%", mb: 2 }}
          required
        />
        <FormLabel sx={{ fontSize: "0.8rem" }}>비밀번호</FormLabel>
        <Input
          type="password"
          name="password"
          placeholder="비밀번호를 입력하세요."
          value={formData.password}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          sx={{ width: "100%", mb: 2 }}
          required
        />
        <FormLabel sx={{ fontSize: "0.8rem" }}>비밀번호 확인</FormLabel>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호를 다시 입력하세요."
          value={formData.confirmPassword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          sx={{ width: "100%", mb: 3 }}
          required
        />

        <Button type="button" onClick={handleSignup} disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </Button>
      </Box>
      {message && <p>{message}</p>}
    </Box>
  );
}
export default Signup;
