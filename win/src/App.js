import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ref, onValue } from "firebase/database"; // Realtime Database 메서드 추가
import { auth, database } from "./firebase.js"; // Firebase 설정 가져오기
import { onAuthStateChanged } from "firebase/auth";
import Signup from "./components/Signup";
import Login from "./components/Login.js";
import SelectTeam from "./components/SelectTeam.js";
import Schedule from "./components/Schedule.jsx";
import { useSelector, useDispatch } from "react-redux";
import Write from "./components/Write.js";
import { fetchPosts } from "./redux/postsSlice.js";
import Home from "./components/Home.js";
import PostDetail from "./components/PostDetail.js";
import MyPage from "./components/MyPage.jsx";
import Record from "./components/Record.jsx";
import ChatRoom from "./components/ChatRoom.jsx";
import EditPost from "./components/EditPost.jsx";

function App() {
  const dispatch = useDispatch();
  // posts가 배열이 아닌 경우 빈 배열로 기본값을 설정
  const posts = useSelector((state) => state.posts.posts || []); // state.posts가 객체이기 때문에 state.posts.posts로 배열에 접근해야 한다.
  console.log("Redux posts:", posts); // 로그로 Redux 상태 확인
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState(""); // nickname 상태 추가

  // Firebase에서 글을 가져와 Redux에 저장
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 사용자가 로그인한 상태
        setIsLoggedIn(true); // 로그인 상태로 설정
        const userId = user.uid;
        const userRef = ref(database, `users/${userId}`);

        // 사용자 데이터 가져오기
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            setNickname(userData.nickname || "사용자");
            setSelectedTeam(userData.selectedTeam || "미선택");
          }
        });
      } else {
        // 사용자가 로그인하지 않은 상태
        setIsLoggedIn(false); // 로그아웃 상태로 설정
        setNickname("");
        setSelectedTeam("미선택");
      }
    });

    return () => unsubscribe(); // firebase 리스너 해제
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem("selectedTeam", selectedTeam);
    }
  }, [selectedTeam]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                isLoggedIn={isLoggedIn}
                selectedTeam={selectedTeam}
                onLogout={() => setIsLoggedIn(false)}
                posts={posts} // posts를 Home 컴포넌트에 전달
              />
            }
          />
          <Route
            path="/login"
            element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
          />
          <Route
            path="/schedule"
            element={<Schedule selectedTeam={selectedTeam} />}
          />

          <Route path="/write" element={<Write />} />

          <Route
            path="/signup"
            element={<Signup onSignupSuccess={() => setIsLoggedIn(true)} />}
          />
          <Route
            path="/select-team"
            element={
              <SelectTeam
                selectedTeam={selectedTeam}
                setSelectedTeam={(team) => {
                  setSelectedTeam(team);
                  localStorage.setItem("selectedTeam", team);
                }}
              />
            }
          />
          <Route
            path="/my-page"
            element={<MyPage nickname={nickname} selectedTeam={selectedTeam} />}
          ></Route>
          <Route
            path="/record"
            element={<Record selectedTeam={selectedTeam} />}
          ></Route>
          <Route
            path="/post/:id"
            selectedTeam={selectedTeam}
            element={<PostDetail />}
          ></Route>
          <Route
            path="/edit/:id"
            selectedTeam={selectedTeam}
            element={<EditPost />}
          />
          <Route path="/post/:id/chat/:roomId" element={<ChatRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
