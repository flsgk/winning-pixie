import React, { useEffect, useState } from "react";
import { data, Link, useNavigate } from "react-router-dom";
import { ref, get, onValue } from "firebase/database"; // Realtime Database 메서드 추가
import { auth, database } from "../firebase.js"; // Firebase 설정 가져오기
import Schedule from "./Schedule.jsx";
import PostList from "./PostList"; // 추가
import Logout from "./Logout";
import Button from "@mui/material/Button";
import "./Home.css";

function Home({ isLoggedIn, onLogout, posts }) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [nickname, setNickname] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  // 닉네임 가져오기
  useEffect(() => {
    if (isLoggedIn) {
      const userId = auth.currentUser.uid;
      const userRef = ref(database, `users/${userId}`);

      // firebase 사용자 데이터 실시간으로 읽어오기
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setNickname(userData.nickname); // 닉네임 저장
          setSelectedTeam(userData.selectedTeam); // 선택된 팀 저장
        }
      });
    }
  }, [isLoggedIn]); // 로그인 상태가 변경될 때만 실행

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    setSelectedDate(date); // 클릭한 날짜 상태 업데이트
    navigate(`/post/${date}`); // 해당 날짜로 이동
  };

  return (
    <div className="container">
      <h1>승리요정🧚🏻‍♀️</h1>
      {isLoggedIn ? (
        <>
          <p>안녕하세요, {nickname}님</p>
          {selectedTeam ? (
            <Schedule
              selectedTeam={selectedTeam}
              onDateClick={handleDateClick}
            />
          ) : (
            <p>팀을 선택해주세요.</p>
          )}
          <div>
            <Link to="/write">
              <button>글쓰기</button>
            </Link>
          </div>

          <Logout onLogout={onLogout} />

          {/* 날짜가 선택된 경우 PostList 컴포넌트에서 필터링된 글을 보여줌 */}
          {selectedDate && (
            <PostList selectedDate={selectedDate} posts={posts} />
          )}
        </>
      ) : (
        <>
          <p>로그인 또는 회원가입을 진행해주세요.</p>
          <nav>
            <div className="button-container">
              <Link to="/login">
                <Button variant="contained" className="Button">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="contained" className="Button">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

export default Home;
