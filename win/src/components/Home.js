import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Schedule from "./Schedule.jsx";
import PostList from "./PostList"; // 추가
import Logout from "./Logout";

function Home({ isLoggedIn, selectedTeam, onLogout, posts }) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    setSelectedDate(date); // 클릭한 날짜 상태 업데이트
    navigate(`/post/${date}`); // 해당 날짜로 이동
  };

  return (
    <div>
      <h2>승리요정🧚🏻‍♀️</h2>
      {isLoggedIn ? (
        <>
          <p>나의 사랑하는 {selectedTeam}⚾️💗</p>
          {selectedTeam && (
            <Schedule
              selectedTeam={selectedTeam}
              onDateClick={handleDateClick}
            />
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

export default Home;
