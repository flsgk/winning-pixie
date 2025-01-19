import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { Divider, Stack } from "@mui/joy";
import useGoogleLogin from "./useGoogleLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // useGoogleLogin 훅 사용
  const { message, loading, handleGoogleLogin } = useGoogleLogin(
    (redirectPath) => {
      navigate(redirectPath); // 페이지 이동
    }
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    const auth = getAuth(); // Firebase 인증 객체 가져오기

    try {
      await signInWithEmailAndPassword(auth, email, password); //signInWithEmailAndPassword 함수로 로그인하기
      navigate("/");
    } catch (error) {}
  };

  return (
    <>
      <Link to="/signup">
        <Button>회원가입</Button>
      </Link>
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
          로그인
        </Typography>

        <Box sx={{ width: "300px" }}>
          <Button
            variant="soft"
            color="neutral"
            fullWidth
            startDecorator={
              <img
                src="https://w7.pngwing.com/pngs/506/509/png-transparent-google-company-text-logo.png"
                alt="Google Icon"
                style={{ width: 20, height: 20 }}
              />
            }
            onClick={handleGoogleLogin}
            sx={{ my: 3 }}
          >
            Continue with Google
          </Button>

          <Divider
            sx={{
              my: 1,
            }}
          >
            or
          </Divider>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="이메일 계정을 입력하세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ width: "100%", mb: 1 }}
          />

          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ width: "100%", mb: 3 }}
          />

          <Button onClick={handleLogin} sx={{ width: "100%" }}>
            로그인하기
          </Button>
        </Box>
        {message && <p>{message}</p>}
      </Box>
    </>
  );
};

export default Login;
