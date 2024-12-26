import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database"; // Realtime Database 메서드 추가
import { auth, database } from "../firebase.js"; // Firebase 설정 가져오기
import { onAuthStateChanged } from "firebase/auth";
import Schedule from "./Schedule.jsx";
import Logout from "./Logout";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import Add from "@mui/icons-material/Add";
import Grid from "@mui/joy/Grid";

function Home({ isLoggedIn, onLogout, posts }) {
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜
  const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 글 목록
  const [nickname, setNickname] = useState(""); // 사용자 닉네임
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]); // 선택된 팀 목록 (배열)
  const [selectedTeamFilter, setSelectedTeamFilter] = useState(""); // 글 필터링 상태
  const [displayedPosts, setDisplayedPosts] = useState([]); // 화면에 표시되는 필터링된 글 목록
  const [loading, setLoading] = useState(true);

  // 로그인 상태 확인
  useEffect(() => {
    setLoading(true); // Firebase 인증 상태 로드 중 로딩 상태 활성화

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 사용자가 로그인한 상태
        const userId = user.uid;
        const userRef = ref(database, `users/${userId}`);

        // 사용자 데이터 가져오기
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            setNickname(userData.nickname || "사용자");
            setSelectedTeam(userData.selectedTeam || "미선택");
          }
          setLoading(false); // 데이터 로딩 완료 후 로딩 상태 해제
        });
      } else {
        // 사용자가 로그인하지 않은 상태
        setNickname("");
        setSelectedTeam("");
        setLoading(false); // 로딩 상태 해제
      }
    });

    // 클린업 함수
    return () => unsubscribe();
  }, []);

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

  // 로딩 상태 처리
  if (loading) {
    return <p>로딩 중...</p>; // 로딩 중일 때 문구 표시
  }

  return (
    <Grid container spacing={2} sx={{ flexGrow: 1, justifyContent: "center" }}>
      <Grid item xs={8}>
        <div className="header">
          <h1>승리요정🧚🏻‍♀️</h1>
          {isLoggedIn ? (
            <p>안녕하세요, {nickname}님</p>
          ) : (
            <p>오늘의 승리요정은 누구?</p>
          )}
        </div>
      </Grid>
      <Grid item xs={4}>
        <Logout />
      </Grid>

      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {isLoggedIn ? (
          <>
            <Grid item xs={12} sm={8}>
              <div className="schedule-container">
                <Schedule
                  selectedTeam={selectedTeam}
                  onDateClick={handleDateClick}
                />
              </div>
            </Grid>

            {selectedDate ? (
              <Grid item xs={12} sm={4}>
                <div className="post-list-container">
                  <h5>
                    {new Date(selectedDate).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                    })}
                    의 승리요정을 찾고 있어요!
                  </h5>
                  <div className="write-button-container">
                    <Link
                      to={`/write?date=${selectedDate}&teams=${selectedTeams.join(
                        ","
                      )}`}
                    >
                      <Button
                        sx={{
                          bgcolor: "secondary.500",
                          color: "black",
                          opacity: 1,
                        }}
                        startDecorator={<Add />}
                      >
                        글쓰기
                      </Button>
                    </Link>
                  </div>
                  {/* 글 목록 및 필터 버튼 */}
                  <div className="team-filter-buttons">
                    <ButtonGroup
                      spacing="0.5rem"
                      aria-label="spacing button group"
                    >
                      {selectedTeams.map((team, index) => (
                        <Button
                          key={index}
                          onClick={() => handleTeamFilter(team)}
                          className={
                            selectedTeamFilter === team ? "active" : ""
                          }
                        >
                          {team}
                        </Button>
                      ))}
                      <Button
                        onClick={() => handleTeamFilter("기타")}
                        className={
                          selectedTeamFilter === "기타" ? "active" : ""
                        }
                      >
                        기타
                      </Button>
                    </ButtonGroup>
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
                          <Link
                            to={`/post/${post.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Button
                              sx={{
                                bgcolor: "secondary.500",
                                color: "black",
                                opacity: 1,
                              }}
                            >
                              자세히 보기
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>이 날짜에 작성된 글이 없습니다.</p>
                  )}
                </div>
              </Grid>
            ) : (
              <p>날짜를 선택하면 관련 글을 볼 수 있습니다.</p>
            )}
          </>
        ) : (
          <>
            <p>로그인 또는 회원가입을 진행해주세요.</p>
            <nav style={{ display: "flex", gap: "1rem" }}>
              <Link to="/login">
                <Button>로그인</Button>
              </Link>
              <Link to="/signup">
                <Button>회원가입</Button>
              </Link>
            </nav>
          </>
        )}
      </Grid>
    </Grid>
  );
}

export default Home;
