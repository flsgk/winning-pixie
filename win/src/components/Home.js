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
        <>
          {/* 첫 번째 Grid container */}
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
              <Box marginTop={3}>
                <Typography
                  level="h1"
                  sx={{
                    fontFamily: "PartialSansKR-Regular",
                    marginBottom: 3,
                  }}
                >
                  승리요정🧚🏻‍♀️
                </Typography>
                <Typography level="title-sm">
                  안녕하세요, {nickname} 요정님
                </Typography>
                <Typography level="title-sm">
                  짜릿한 승리를 함께할 요정을 찾아보세요!
                </Typography>
              </Box>
            </Grid>

            <Grid
              item
              xs={4}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Box
                marginBottom={3}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
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

            {/* 두 번째 Grid container */}

            <Grid item xs={8}>
              <Box>
                <Schedule
                  selectedTeam={selectedTeam}
                  onEventClick={handleEventClick}
                />
              </Box>
            </Grid>

            {/* selectedDate가 있을 때만 출력 */}
            {selectedDate && (
              <Grid item xs={4}>
                <Box
                  sx={{
                    height: "600px",
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
                      aria-label="radius button group"
                      sx={{
                        marginBottom: 1,
                        marginTop: 1,
                        "--ButtonGroup-radius": "40px",
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
                      >
                        기타
                      </Button>
                    </ButtonGroup>
                  </Box>
                  <Divider orientation="horizontal" />

                  {/* 필터된 글 목록 */}
                  {filteredPosts.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        maxHeight: 500,
                        overflowY: "auto",
                        paddingX: 1,
                        padding: "5px",
                      }}
                    >
                      {displayedPosts.map(
                        (post) =>
                          post.status === "모집 중" && (
                            <Link
                              to={`/post/${post.id}`}
                              style={{ textDecoration: "none" }}
                              key={post.id}
                            >
                              <Card
                                variant="outlined"
                                sx={{
                                  width: "350px",
                                  maxWidth: "100%",
                                  margin: "auto",
                                  marginBottom: 1,
                                  marginTop: 1,
                                  boxShadow: "sm",
                                  "@media (max-width: 480px)": {
                                    width: "200px",
                                  },
                                }}
                              >
                                <CardContent>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography level="title-lg">
                                      {post.title}
                                    </Typography>
                                    <Chip
                                      color={
                                        post.status === "모집 중"
                                          ? "success"
                                          : "neutral"
                                      }
                                    >
                                      {post.status}
                                    </Chip>
                                  </Box>

                                  <Typography
                                    level="body-sm"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                  >
                                    <EditRoundedIcon
                                      sx={{ fontSize: "1rem" }}
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
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        loggedOutContent
      )}
    </>
  );
}

export default Home;
