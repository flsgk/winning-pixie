import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login.js";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Routes로 각 페이지 경로 정의 */}
        <Routes>
          <Route path="/" element={<Home />} /> {/* 홈 화면 */}
          <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
          <Route path="/signup" element={<Signup />} /> {/* 회원가입 페이지 */}
        </Routes>
      </div>
    </Router>
  );
}

// 홈 화면 컴포넌트
function Home() {
  return (
    <div>
      <h2>환영합니다! 홈 화면입니다.</h2>
      <nav>
        <Link to="/login">
          <button>로그인</button>
        </Link>
        <Link to="/signup">
          <button>회원가입</button>
        </Link>
      </nav>
    </div>
  );
}

export default App;
