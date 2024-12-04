import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { auth } from "./firebase"; // auth 가져오기
import Signup from "./components/Signup";
import Login from "./components/Login.js";
import SelectTeam from "./components/SelectTeam.js";
import Logout from "./components/Logout.js";
import Schedule from "./components/Schedule.jsx";
import { useSelector, useDispatch } from "react-redux";
import Write from "./components/Write.js";
import { fetchPosts } from "./redux/postsSlice.js";

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
        </Routes>
      </div>
    </Router>
  );
}

function Home({ isLoggedIn, selectedTeam, onLogout, posts }) {
  // posts가 배열인지 확인 (빈 배열이 기본값)
  console.log("posts:", posts);

  return (
    <div>
      <h2>승리요정🧚🏻‍♀️</h2>
      {isLoggedIn ? (
        <>
          <p>나의 사랑하는 {selectedTeam}⚾️💗</p>
          <Schedule selectedTeam={selectedTeam} />
          <div>
            <Link to="/write">
              <button>글쓰기</button>
            </Link>
          </div>
          <div>
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id}>
                  <h4>{post.title}</h4>
                  <p>{post.playDate}</p>
                </div>
              ))
            ) : (
              <p>게시물이 없습니다.</p>
            )}
          </div>
          <Logout onLogout={onLogout} />
        </>
      ) : (
        <>
          <p>로그인 또는 회원가입을 진행해주세요.</p>
          <nav>
            <Link to="/login">
              <button>로그인</button>
            </Link>
            <Link to="/signup">
              <button>회원가입</button>
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}

export default App;
