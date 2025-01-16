import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database"; // Realtime Database 메서드 추가
import { auth, database } from "../firebase.js"; // Firebase 설정 가져오기
import { onAuthStateChanged } from "firebase/auth";
import Schedule from "./Schedule.jsx";
import Logout from "./Logout";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import Add from "@mui/icons-material/Add";
import Grid from "@mui/joy/Grid";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

function Home({ isLoggedIn, posts }) {
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
  const handleEventClick = ({ date, teams }) => {
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
    const filterPostsByTeam = () => {
      if (selectedTeamFilter === "") {
        return filteredPosts.filter(
          (post) =>
            selectedTeams.includes(post.yourTeam) || post.yourTeam === "기타"
        );
      }
      return filteredPosts.filter(
        (post) => post.yourTeam === selectedTeamFilter
      ); // 기존 post.team → post.yourTeam으로 수정
    };

    const filtered = filterPostsByTeam();
    setDisplayedPosts(filtered); // 필터링된 글 목록 갱신
    console.log("Filtered posts:", filtered);
  }, [selectedTeamFilter, filteredPosts, selectedTeams]); // selectedTeamFilter와 filteredPosts 상태에 따라 다시 실행

  // 로딩 상태 처리
  if (loading) {
    return <p>로딩 중...</p>; // 로딩 중일 때 문구 표시
  }

  // 로그인 상태에 따른 콘텐츠 분리
  const loggedOutContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // 세로 중앙 정렬
        alignItems: "center", // 가로 중앙 정렬
        height: "100vh", // 화면의 100% 높이 차지
      }}
    >
      <Typography level="h1">승리요정🧚🏻‍♀️</Typography>
      <Stack direction="row" spacing={2} mt={5}>
        <Link to="/login">
          <Button>로그인</Button>
        </Link>
        <Link to="/signup">
          <Button>회원가입</Button>
        </Link>
      </Stack>
    </Box>
  );

  return (
    <>
      {isLoggedIn ? (
        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "space-between",
            paddingX: 5,
          }}
        >
          <Grid item xs={8}>
            <div className="header">
              <Typography level="h1">승리요정🧚🏻‍♀️</Typography>
              <Typography level="title-sm">
                안녕하세요, {nickname} 요정님
              </Typography>
              <Typography level="title-sm">
                짜릿한 승리를 함께할 요정을 찾아보세요!
              </Typography>
            </div>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: "flex", // Flexbox 활성화
              justifyContent: "flex-end", // 내부에서 오른쪽 정렬
              alignItems: "center", // 세로 정렬
            }}
          >
            <Box
              sx={{
                display: "flex", // 요소를 가로로 배치
                gap: 1, // 요소 간의 간격 (theme.spacing 단위, 기본적으로 8px)
                alignItems: "center", // 세로 정렬을 중앙으로 맞추기 (선택 사항)
              }}
            >
              <Logout />
              <Link to="/my-page">
                <Button
                  color="neutral"
                  variant="soft"
                  sx={{ borderRadius: 10, width: "100px" }}
                >
                  MY
                </Button>
              </Link>
            </Box>
          </Grid>

          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <>
              <Grid item xs={12} sm={8}>
                <Box sx={{ marginTop: 5 }}>
                  <Schedule
                    selectedTeam={selectedTeam}
                    onEventClick={handleEventClick}
                  />
                </Box>
              </Grid>

              {selectedDate ? (
                <Grid item xs={12} sm={4} sx={{ paddingX: 4 }}>
                  <Box
                    sx={{
                      marginTop: "90px",
                      backgroundColor: "#f7f7f7",
                      borderRadius: "20px",
                      height: "600px",
                    }}
                  >
                    <Box
                      sx={{
                        padding: "10px",
                      }}
                    >
                      <Typography level="h4">
                        {new Date(selectedDate).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                        })}
                        의 승리요정을 찾고 있어요!
                      </Typography>

                      {/* 글 목록 및 필터 버튼 */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 1,
                        }}
                      >
                        <Link
                          to={`/write?date=${selectedDate}&teams=${selectedTeams.join(
                            ","
                          )}`}
                        >
                          <Button
                            startDecorator={<Add />}
                            color="neutral"
                            variant="solid"
                            sx={{
                              borderRadius: "20px",
                            }}
                          >
                            글쓰기
                          </Button>
                        </Link>
                        <ButtonGroup
                          spacing="0.5rem"
                          aria-label="spacing button group"
                          sx={{
                            marginBottom: 1,
                            marginTop: 1,
                            borderRadius: "20px",
                          }}
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
                            sx={{
                              borderRadius: "20px",
                            }}
                          >
                            기타
                          </Button>
                        </ButtonGroup>
                      </Box>
                      <Divider orientation="horizontal" />

                      {filteredPosts.length > 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            maxHeight: 500, // 최대 높이 설정 (필요에 맞게 조정)
                            overflowY: "auto", // 세로 스크롤 활성화
                            paddingX: 1, // 부모 컨테이너 내부 여백 추가
                            padding: "5px",
                          }}
                        >
                          {displayedPosts.map(
                            (post) =>
                              post.status === "모집 중" && (
                                <Link
                                  to={`/post/${post.id}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Card
                                    key={post.id}
                                    className="post-card"
                                    variant="outlined"
                                    sx={{
                                      width: "350px",
                                      maxWidth: "100%", // 화면 너비에 따라 너무 커지지 않도록 제한
                                      margin: "auto", // 가로 정렬을 중앙으로
                                      marginBottom: 1,
                                      marginTop: 1,
                                      boxShadow: "sm",

                                      "@media (max-width: 480px)": {
                                        width: "200px", // 화면 너비가 600px 이하일 때는 100%로 설정
                                      },
                                    }}
                                  >
                                    <CardContent>
                                      <Box
                                        className="post-header"
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Box>
                                          <Typography level="title-lg">
                                            {post.title}
                                          </Typography>
                                        </Box>

                                        <Box>
                                          <Chip
                                            color={
                                              post.status === "모집 중"
                                                ? "success"
                                                : "neutral"
                                            }
                                            sx={{
                                              mr: 0.5,
                                            }}
                                          >
                                            {post.status}
                                          </Chip>
                                          <Chip size="md" variant="soft">
                                            {post.yourTeam}
                                          </Chip>
                                        </Box>
                                      </Box>

                                      <Typography
                                        level="body-sm"
                                        className="post-date"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "4px",
                                        }}
                                      >
                                        <EditRoundedIcon
                                          sx={{
                                            fontSize: "1rem",
                                            marginRight: "4px",
                                          }}
                                        />
                                        {post.createdDate}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Link>
                              )
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ padding: 2 }}>작성된 글이 없습니다.</Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ) : (
                <></>
              )}
            </>
          </Grid>
        </Grid>
      ) : (
        loggedOutContent
      )}
    </>
  );
}

export default Home;
