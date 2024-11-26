import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { auth } from "./firebase"; // auth 가져오기
import Signup from "./components/Signup";
import Login from "./components/Login.js";
import SelectTeam from "./components/SelectTeam.js";
import Logout from "./components/Logout.js";

function App() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <Router>
      <div className="App">
        {/* Routes로 각 페이지 경로 정의 */}
        <Routes>
          <Route
            path="/"
            element={
              <Home
                isLoggedIn={isLoggedIn}
                selectedTeam={selectedTeam}
                onLogout={() => setIsLoggedIn(false)}
              />
            }
          />
          {/* Home 컴포넌트에 isLoggedIn, selectedTeam 데이터 전달 */}
          {/* 홈 화면 */}
          <Route
            path="/login"
            element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
          />{" "}
          {/* 로그인 페이지 */}
          <Route
            path="/signup"
            element={<Signup onSignupSuccess={() => setIsLoggedIn(true)} />}
          />{" "}
          {/* 회원가입 페이지 */}
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
          {/* 구단 선택 페이지 */}
        </Routes>
      </div>
    </Router>
  );
}

// 홈 화면 컴포넌트
function Home({ isLoggedIn, selectedTeam, onLogout }) {
  return (
    <div>
      <h2>승리요정🧚🏻‍♀️</h2>
      {isLoggedIn ? (
        <>
          <p>나의 사랑하는 {selectedTeam}⚾️💗</p>
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
