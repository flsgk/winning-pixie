// Signup.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Stack, TextField } from "@mui/material";
import useSignupForm from "./useSignupForm";
import { Card, SignUpContainer } from "./StyledComponents"; // named import
import { styled } from "@mui/material/styles";

const Input = styled(TextField)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  "& .MuiInputBase-root": {
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function Signup() {
  const navigate = useNavigate();

  const {
    formData,
    message,
    loading,
    handleChange,
    handleSignup,
    handleKeyDown,
  } = useSignupForm(() => navigate("/select-team")); // 성공 시 팀 선택 화면으로 이동

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "20px" }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 2 }}>
        회원가입
      </Typography>

      {message && (
        <Typography sx={{ color: "error.main", textAlign: "center", mb: 2 }}>
          {message}
        </Typography>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <Card>
          <SignUpContainer spacing={2}>
            <Input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
              required
            />
            <Input
              type="text"
              name="nickname"
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />
            <Input
              type="text"
              name="fullname"
              placeholder="이름"
              value={formData.fullname}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSignup}
              disabled={loading}
              fullWidth
            >
              {loading ? "가입 중..." : "회원가입"}
            </Button>
          </SignUpContainer>
        </Card>
      </form>
    </div>
  );
}
