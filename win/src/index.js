import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import {
  ThemeProvider as MaterialThemeProvider,
  createTheme,
} from "@mui/material/styles";
import {
  CssVarsProvider as JoyCssVarsProvider,
  extendTheme as joyExtendTheme,
} from "@mui/joy/styles";
import { deepmerge } from "@mui/utils";
import CssBaseline from "@mui/material/CssBaseline";

// Material UI 테마
const materialTheme = createTheme({
  palette: {
    primary: {
      main: "#F6FF8B",
    },
    secondary: {
      main: "#ff4081",
    },
  },
  typography: {
    fontFamily: `'Pretendard Variable'`,
  },
});

// Joy UI 테마
const joyTheme = joyExtendTheme({
  palette: {
    primary: {
      300: "#F6FF8B", // 누락된 값 추가
    },
  },
  typography: {
    fontFamily: `'Pretendard Variable'`,
  },
});

// 테마 병합
const mergedTheme = deepmerge(materialTheme, joyTheme);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <MaterialThemeProvider theme={mergedTheme}>
        <CssBaseline />
        <JoyCssVarsProvider theme={mergedTheme}>
          <App />
        </JoyCssVarsProvider>
      </MaterialThemeProvider>
    </React.StrictMode>
  </Provider>
);

reportWebVitals();
