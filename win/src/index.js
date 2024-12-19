import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import { extendTheme, CssVarsProvider } from "@mui/joy/styles";

const theme = extendTheme({
  typography: {
    fontFamily: `"Pretendard"`,
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: "#e3f2fd",
          100: "#bbdefb",
          200: "#90caf9",
          300: "#64b5f6",
          400: "#42a5f5",
          500: "#2196f3", // 기본 색상
          600: "#1e88e5",
          700: "#1976d2",
          800: "#1565c0",
          900: "#0d47a1",
        },
        secondary: {
          500: "#F6FF8B", // 예: 원하는 서브 컬러
        },
        customPink: {
          500: "#e91e63", // 직접 만든 팔레트
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <CssVarsProvider theme={theme}>
        <App />
      </CssVarsProvider>
    </React.StrictMode>
  </Provider>
);

reportWebVitals();
