import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { auth } from "./firebase"; // auth 가져오기
import Signup from "./components/Signup";
import Login from "./components/Login.js";
import SelectTeam from "./components/SelectTeam.js";
import Logout from "./components/Logout.js";
import Schedule from "./components/Schedule.js";
import Post from "./components/Post.js";
import { useSelector, useDispatch } from "react-redux";
import Write from "./components/Write.js";
import { setPosts } from "./redux/postsSlice.js";

function App() {
  const dispatch = useDispatch();
  // posts가 배열이 아닌 경우 빈 배열로 기본값을 설정
  const posts = useSelector((state) => state.posts.posts || []); // state.posts가 객체이기 때문에 state.posts.posts로 배열에 접근해야 한다.
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로컬 스토리지에서 Redux 상태 초기화
  useEffect(() => {
    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
      // 로컬 스토리지에서 posts 데이터를 배열로 파싱
      const parsedPosts = JSON.parse(savedPosts);
      if (Array.isArray(parsedPosts)) {
        dispatch(setPosts(parsedPosts)); // posts가 배열이면 Redux 상태로 설정
      } else {
        console.error("Posts 데이터가 배열이 아닙니다.");
      }
    }
  }, [dispatch]);

  // Redux 상태가 변경이 될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("posts", JSON.stringify(posts)); // posts 데이터를 로컬 스토리지에 저장
    }
  }, [posts]);

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
            {/* posts가 배열일 때만 .map() 실행 */}
            {Array.isArray(posts) &&
              posts.map((post) => <Post key={post.id} post={post} />)}
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
