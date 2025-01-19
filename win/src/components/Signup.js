import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSignupForm from "./useSignupForm";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { FormControl, FormHelperText } from "@mui/joy";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

function Signup() {
  const navigate = useNavigate();
  // 커스텀 훅 사용
  const {
    formData,
    errors,
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
      <Link to="/login">
        <Button>로그인</Button>
      </Link>
      <Typography component="h1" level="h3">
        회원가입
      </Typography>
      {errors.allField && <Typography>{errors.fullname}</Typography>}
      <Box sx={{ width: "300px" }}>
        <FormControl error={errors.fullname} sx={{ mb: 2 }}>
          <FormLabel sx={{ fontSize: "0.8rem" }}>이름(실명)</FormLabel>

          <Input
            type="text"
            name="fullname"
            placeholder={errors.email ? "" : "이름을 입력하세요."}
            value={formData.fullname}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={{ width: "100%" }}
            required
          />
          {errors.fullname && (
            <FormHelperText>
              <InfoOutlined />
              {errors.fullname}
            </FormHelperText>
          )}
        </FormControl>

        <FormControl error={errors.nickname} sx={{ mb: 2 }}>
          <FormLabel sx={{ fontSize: "0.8rem" }}>닉네임</FormLabel>

          <Input
            type="text"
            name="nickname"
            placeholder={errors.email ? "" : "닉네임을 입력하세요."}
            value={formData.nickname}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={{ width: "100%" }}
            required
          />
          {errors.nickname && (
            <FormHelperText>
              <InfoOutlined />
              {errors.nickname}
            </FormHelperText>
          )}
        </FormControl>

        <FormControl error={errors.email} sx={{ mb: 2 }}>
          <FormLabel sx={{ fontSize: "0.8rem" }}>이메일 계정</FormLabel>

          <Input
            type="email"
            name="email"
            placeholder={errors.email ? "" : "이메일 계정을 입력하세요."}
            value={formData.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
            sx={{ width: "100%" }}
            required
          />
          {errors.email && (
            <FormHelperText>
              <InfoOutlined />
              {errors.email}
            </FormHelperText>
          )}
        </FormControl>

        <FormControl error={errors.password} sx={{ mb: 2 }}>
          <FormLabel sx={{ fontSize: "0.8rem" }}>비밀번호</FormLabel>

          <Input
            type="password"
            name="password"
            placeholder={errors.email ? "" : "비밀번호를 입력하세요."}
            value={formData.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={{ width: "100%" }}
            required
          />
          {errors.password && (
            <FormHelperText>
              <InfoOutlined />
              {errors.password}
            </FormHelperText>
          )}
        </FormControl>

        <FormControl error={errors.confirmPassword} sx={{ mb: 2 }}>
          <FormLabel sx={{ fontSize: "0.8rem" }}>비밀번호 확인</FormLabel>

          <Input
            type="password"
            name="confirmPassword"
            placeholder={errors.email ? "" : "비밀번호를 다시 입력하세요."}
            value={formData.confirmPassword}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={{ width: "100%" }}
            required
          />
          {errors.confirmPassword && (
            <FormHelperText>
              <InfoOutlined />
              {errors.confirmPassword}
            </FormHelperText>
          )}
        </FormControl>

        <Button type="button" onClick={handleSignup} disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </Button>
      </Box>
    </Box>
  );
}
export default Signup;
