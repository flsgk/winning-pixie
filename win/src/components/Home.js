import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database"; // Realtime Database 메서드 추가
import { auth, database } from "../firebase.js"; // Firebase 설정 가져오기
import Schedule from "./Schedule.jsx";
import Logout from "./Logout";
import Button from "@mui/material/Button";
import "./CSS/Home.css";

function Home({ isLoggedIn, onLogout, posts }) {
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜
  const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 글 목록
  const [nickname, setNickname] = useState(""); // 사용자 닉네임
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]); // 선택된 팀 목록 (배열)
  const [selectedTeamFilter, setSelectedTeamFilter] = useState(""); // 글 필터링 상태
  const [displayedPosts, setDisplayedPosts] = useState([]); // 화면에 표시되는 필터링된 글 목록

  // 닉네임 및 선택된 팀 가져오기
  useEffect(() => {
    if (isLoggedIn) {
      const userId = auth.currentUser.uid;
      const userRef = ref(database, `users/${userId}`);

      // firebase 사용자 데이터 실시간으로 읽어오기
      const unsubscribe = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setNickname(userData.nickname || "사용자"); // 닉네임 저장
          setSelectedTeam(userData.selectedTeam || "미선택"); // 선택된 팀 저장
        }
      });

      return () => unsubscribe; // 컴포넌트 언마운트 시 리스너 해제
    }
  }, [isLoggedIn]); // 로그인 상태가 변경될 때만 실행

  // 날짜 클릭 핸들러
  const handleDateClick = ({ date, teams }) => {
    const filtered = posts.filter((post) => post.playDate === date);
    setFilteredPosts(filtered);
    setSelectedDate(date); // 날짜 저장
    setSelectedTeams(teams); // 선택된 팀 목록 저장
    setSelectedTeamFilter(""); // 필터 초기화
    console.log("Teams passed to handleDateClick:", teams);
  };

  // 팀별 필터 버튼 클릭 핸들러
  const handleTeamFilter = (team) => {
    console.log(`Selected team filter: ${team}`); // 선택한 팀을 로그로 출력
    setSelectedTeamFilter(team); // 선택한 팀 저장
  };

  // 팀별 필터링된 글 목록을 화면에 업데이트
  useEffect(() => {
    // 'selectedTeamFilter'가 바뀔 때마다 필터링된 글 목록 갱신
    const filterPostsByTeam = () => {
      // selectedTeamFilter 값에 따라 필터링
      if (selectedTeamFilter === "") {
        return filteredPosts; // 필터링되지 않으면 전체 목록
      }
      return filteredPosts.filter((post) => post.team === selectedTeamFilter);
    };

    const filtered = filterPostsByTeam();
    setDisplayedPosts(filtered); // 필터링된 글 목록 갱신
    console.log("Filtered posts:", filtered);
  }, [selectedTeamFilter, filteredPosts]); // selectedTeamFilter와 filteredPosts 상태에 따라 다시 실행

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

              {/* 날짜 선택 시 글 목록 및 글쓰기 버튼 표시 */}
              {selectedDate ? (
                <div className="post-list-container">
                  <h5>{selectedDate}의 승리요정을 찾고 있어요!</h5>

                  {/* 글쓰기 버튼 - 선택된 날짜 전달 */}
                  <div className="write-button-container">
                    <Link
                      to={`/write?date=${selectedDate}&teams=${selectedTeams.join(
                        ","
                      )}`}
                    >
                      <button>글쓰기</button>
                    </Link>
                  </div>

                  {/* 팀 필터 버튼 */}
                  <div className="team-filter-buttons">
                    {selectedTeams.map((team, index) => (
                      <button
                        key={index}
                        onClick={() => handleTeamFilter(team)}
                        className={selectedTeamFilter === team ? "active" : ""}
                      >
                        {team}
                      </button>
                    ))}
                    <button
                      onClick={() => handleTeamFilter("기타")}
                      className={selectedTeamFilter === "기타" ? "active" : ""}
                    >
                      기타
                    </button>
                  </div>

                  {filteredPosts.length > 0 ? (
                    <div className="post-cards">
                      {displayedPosts.map((post) => (
                        <div key={post.id} className="post-card">
                          <div className="post-header">
                            <h4>{post.title}</h4>
                            <p className="post-team">{post.team}</p>
                          </div>
                          <p>{post.content}</p>
                          <p className="post-date">작성일:{post.createdDate}</p>
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
