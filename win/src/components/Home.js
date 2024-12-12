import React, { useEffect, useState } from "react";
import { data, Link } from "react-router-dom";
import { ref, get, onValue } from "firebase/database"; // Realtime Database 메서드 추가
import { auth, database } from "../firebase.js"; // Firebase 설정 가져오기
import Schedule from "./Schedule.jsx";
import Logout from "./Logout";
import Button from "@mui/material/Button";
import "./CSS/Home.css";

function Home({ isLoggedIn, onLogout, posts }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 글 목록
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
          setNickname(userData.nickname || "사용자"); // 닉네임 저장
          setSelectedTeam(userData.selectedTeam || "미선택"); // 선택된 팀 저장
        }
      });
    }
  }, [isLoggedIn]); // 로그인 상태가 변경될 때만 실행

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    setSelectedDate(date); // 클릭한 날짜 상태 업데이트
    const filtered = posts.filter((post) => post.playDate === date);
    setFilteredPosts(filtered);
  };

  return (
    <div className="container">
      <h1>승리요정🧚🏻‍♀️</h1>
      {isLoggedIn ? (
        <>
          <p>안녕하세요, {nickname}님</p>
          {selectedTeam ? (
            <>
              <Schedule
                selectedTeam={selectedTeam}
                onDateClick={handleDateClick}
              />

              {/* 날짜 선택 시 글 목록 표시 */}
              {selectedDate ? (
                <div className="post-list-container">
                  <h5>{selectedDate}의 승리요정을 찾고 있어요!</h5>
                  {filteredPosts.length > 0 ? (
                    <div className="post-cards">
                      {filteredPosts.map((post) => (
                        <div key={post.id} className="post-card">
                          <h4>{post.title}</h4>
                          <p>{post.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>이 날짜에 작성된 글이 없습니다.</p>
                  )}
                </div>
              ) : (
                <p>날짜를 선택하면 관련 글을 볼 수 있습니다.</p>
              )}
            </>
          ) : (
            <p>팀을 선택해주세요.</p>
          )}
          <div>
            <Link to="/write">
              <button>글쓰기</button>
            </Link>
          </div>

          <Logout onLogout={onLogout} />
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
