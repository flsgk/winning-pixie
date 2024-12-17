import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { auth } from "./firebase"; // auth 가져오기
import Signup from "./components/Signup";
import Login from "./components/Login.js";
import SelectTeam from "./components/SelectTeam.js";
import Schedule from "./components/Schedule.jsx";
import { useSelector, useDispatch } from "react-redux";
import Write from "./components/Write.js";
import { fetchPosts } from "./redux/postsSlice.js";
import Home from "./components/Home.js";
import PostDetail from "./components/PostDetail.js";

function App() {
  const dispatch = useDispatch();
  // posts가 배열이 아닌 경우 빈 배열로 기본값을 설정
  const posts = useSelector((state) => state.posts.posts || []); // state.posts가 객체이기 때문에 state.posts.posts로 배열에 접근해야 한다.
  console.log("Redux posts:", posts); // 로그로 Redux 상태 확인
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Firebase에서 글을 가져와 Redux에 저장
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true); //로그인 상태로 설정
        const savedItem = localStorage.getItem("selectedTeam");
        if (savedItem) {
          setSelectedTeam(savedItem);
        }
      } else {
        setIsLoggedIn(false); // 로그아웃 상태로 설정
        setSelectedTeam(null);
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
          <Route path="/post/:id" element={<PostDetail />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
