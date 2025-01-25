import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import { extendTheme, CssVarsProvider } from "@mui/joy/styles";
import "./index.css";
import { CssBaseline } from "@mui/joy";

const theme = extendTheme({
  typography: {
    body1: {
      fontFamily: '"Pretendard-Regular", sans-serif', // 기본 폰트 설정
    },
  },
  fontFamily: {
    body: '"Pretendard-Regular", sans-serif', // Joy UI에서 전역 body 폰트 설정
    display: '"Pretendard-Regular", "PartialSansKR-Regular", sans-serif', // 제목 등 display 스타일 폰트 설정
    fallback: "sans-serif", // 폴백 폰트
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </React.StrictMode>
  </Provider>
);

reportWebVitals();
