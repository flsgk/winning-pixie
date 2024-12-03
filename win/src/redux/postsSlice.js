// postsSlice.js (Redux Slice 만들기)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; // createAsyncThunk : 비동기 작업 처리를 도와주는 함수
import { database } from "../firebase";
import { onValue, ref, set, get, child } from "firebase/database";

// firebase에서 글 가져오기
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const postsRef = ref(database, "posts/");
  const posts = []; // 데이터를 담을 배열

  return new Promise((resolve, reject) => {
    onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Firebase 데이터를 배열 형식으로 변환
          Object.keys(data).forEach((key) => {
            posts.push({
              id: key, // 고유 키를 id로 저장
              ...data[key], // 나머지 데이터를 펼침
            });
          });
          resolve(posts); // 변환된 데이터를 반환
        } else {
          resolve([]); // 데이터가 없을 경우 빈 배열 반환
        }
      },
      (error) => {
        console.error("Firebase 데이터 가져오기 실패:", error);
        reject(error);
      }
    );
  });
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
  initialState: { posts: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload; // 가져온 글 목록으로 상태 업데이트
      })
      .addCase(addPostToFirebase.fulfilled, (state, action) => {
        state.push(action.payload); // 새 글 추가
      });
  },
});

export default postsSlice.reducer; // 리듀서를 기본값으로 내보냄
