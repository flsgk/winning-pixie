// postsSlice.js (Redux Slice 만들기)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; // createAsyncThunk : 비동기 작업 처리를 도와주는 함수
import { database } from "../firebase";
import { onValue, ref, set, get, child } from "firebase/database";

// firebase에서 글 가져오기 (onValue 사용 시 데이터가 배열에 반복적으로 추가할 위험이 있어 get 사용하도록 수정)
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const postsRef = ref(database, "posts/");
  try {
    const snapshot = await get(postsRef);
    const data = snapshot.val();
    if (data) {
      // 데이터를 배열 형식으로 반황
      return Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
    }
    return []; // 데이터가 없을 경우 빈 배열 반환
  } catch (error) {
    console.error("Firebase 데이터 가져오기 실패:", error);
    throw error;
  }
});

// firebase에서 글 추가하기
export const addPostToFirebase = createAsyncThunk(
  "posts/addPost",
  async (post) => {
    const newPostKey = Date.now().toString(); // 고유한 키 생성
    const postRef = ref(database, "posts/" + newPostKey); // posts/ 경로에 새 글 추가
    await set(postRef, post);
    return { id: newPostKey, ...post };
  }
);

// Reducer Slice 만들기
const postsSlice = createSlice({
  name: "posts",
  // 초기 상태 구조 변경하기
  initialState: { posts: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true; // 로딩 시작
        state.error = null; // 에러 초기화
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false; // 로딩 종료
        state.posts = action.payload; // 데이터 저장
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false; // 로딩 종료
        state.error = action.error.message; // 에러 메시지 저장
      })
      .addCase(addPostToFirebase.fulfilled, (state, action) => {
        state.posts = [...state.posts, action.payload]; //새로운 글을 기존 상태에 추가
      });
  },
});

export default postsSlice.reducer; // 리듀서를 기본값으로 내보냄
