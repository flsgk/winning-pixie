// store.js
import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./postsSlice"; // postsSlice.js에서 리듀서를 임포트
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    posts: postsReducer, // posts 리듀서 설정
    chat: chatReducer,
  },
});

export default store;
