// postsSlice.js
import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = {
  posts: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.posts.push(action.payload);
    },
    setPosts: (state, action) => {
      state.posts = action.payload; // 기존 posts를 새로 설정할 때 사용할 수 있는 액션
    },
  },
});

export const { addPost, setPosts } = postsSlice.actions;
export default postsSlice.reducer; // 리듀서를 기본값으로 내보냄
