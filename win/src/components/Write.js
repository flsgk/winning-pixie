import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addPostToFirebase } from "../redux/postsSlice";
import FormLabel from "@mui/joy/FormLabel";
import FormHelperText from "@mui/joy/FormHelperText";
import Input from "@mui/joy/Input";
import ReactEditor from "./ReactEditor";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Stack from "@mui/joy/Stack";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import GoBackButton from "./GoBackButton";
import { auth, database } from "../firebase";
import { onValue, ref } from "firebase/database";

function Write() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // URL의 쿼리 파라미터에서 날짜, 팀 정보 가져오기
  // URL에서 쿼리 파라미터 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const initialDate = urlParams.get("date") || "";
  const initialTeams = urlParams.get("teams")
    ? urlParams.get("teams").split(",")
    : []; // 전달받은 팀 목록을 분리

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [playDate, setPlayDate] = useState(initialDate); // 날짜 기본 값 설정
  const [teams, setTeams] = useState([...initialTeams, "기타"]); // '기타' 추가
  const [yourTeam, setYourTeam] = useState(""); // '선택'으로 초기화
  const [myTeam, setMyTeam] = useState("");
  const [nickname, setNickname] = useState(""); // 현재 사용자의 닉네임 상태 추가
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    // 현재 사용자 정보 가져오기 (닉네임)
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setNickname(userData.nickname);
        }
      });
    }
  }, [auth]);

  console.log(teams); // teams 배열을 확인하여 정상적으로 팀들이 전달되는지 확인

  const handleSave = (e) => {
    e.preventDefault();

    // 현재 날짜를 ISO 형식으로 저장 (작성일)
    const createdDate = new Date().toLocaleDateString("ko-KR");

    const newPost = {
      title,
      content,
      playDate,
      myTeam: myTeam,
      createdDate,
      yourTeam: yourTeam,
      authorNickname: nickname,
      status: "모집 중",
      capacity,
    };

    console.log("newPost:", newPost); // 값이 제대로 설정되는지 확인
    dispatch(addPostToFirebase(newPost)); // Redux store에 글 추가
    navigate("/");
  };

  return (
    <>
      <Box sx={{ marginLeft: "10px" }}>
        <GoBackButton />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // 필요시 세로 방향 정렬
          justifyContent: "center", // 상단부터 정렬
          alignItems: "center",
        }}
      >
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Stack spacing={1}>
            <FormLabel>글 제목</FormLabel>
            <Input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder=""
              sx={{ width: 700 }}
            />
            <FormHelperText>
              {" "}
              {new Date(playDate).toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
              })}
              의 승리요정을 찾는 게시물을 작성해주세요.
            </FormHelperText>
          </Stack>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 3,
            }}
          >
            <Stack spacing={1}>
              <FormLabel>경기 날짜</FormLabel>
              <Input
                type="date"
                name="playDate"
                value={playDate}
                onChange={(e) => setPlayDate(e.target.value)}
                sx={{ width: 300 }}
              />
            </Stack>
            <Stack spacing={1}>
              <FormLabel>몇 명과 함께하고 싶나요?</FormLabel>
              <Select
                value={capacity}
                onChange={(event, value) => setCapacity(value)}
                sx={{ width: 150 }}
                placeholder="선택"
              >
                <Option value={1}>1</Option>
                <Option value={2}>2</Option>
                <Option value={3}>3</Option>
                <Option value={4}>4</Option>
              </Select>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
            }}
          >
            <Stack spacing={1}>
              <FormLabel>내용</FormLabel>
              <ReactEditor value={content} onChange={setContent} />
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
            }}
          >
            <Stack spacing={1}>
              <FormLabel>어떤 팀을 응원하나요?</FormLabel>
              <Select
                name="myTeam"
                value={myTeam} // 초기값 설정
                onChange={(event, value) => setMyTeam(value)}
                startDecorator={<FavoriteBorder />}
                sx={{ width: 300 }}
                placeholder="선택"
              >
                <Option value={initialTeams[0]}>{initialTeams[0]}</Option>
                {/* 첫 번째 팀 */}
                <Option value={initialTeams[1]}>{initialTeams[1]}</Option>
                {/* 두 번째 팀 */}
                <Option value="기타">기타</Option> {/* 기타 옵션 */}
              </Select>
            </Stack>

            <Stack spacing={1}>
              <FormLabel>어떤 팀의 요정과 함께 하고 싶나요?</FormLabel>
              <Select
                name="yourTeam"
                value={yourTeam} // 초기값 설정
                onChange={(event, value) => setYourTeam(value)}
                startDecorator={<FavoriteBorder />}
                sx={{ width: 300 }}
                placeholder="선택"
              >
                <Option value={initialTeams[0]}>{initialTeams[0]}</Option>
                {/* 첫 번째 팀 */}
                <Option value={initialTeams[1]}>{initialTeams[1]}</Option>
                {/* 두 번째 팀 */}
                <Option value="기타">기타</Option> {/* 기타 옵션 */}
              </Select>
            </Stack>
          </Box>
        </Stack>
        <Box
          marginTop={5}
          sx={{ display: "flex", flexDirection: "row", gap: 2 }}
        >
          <Button onClick={handleSave} sx={{ width: 100 }}>
            저장
          </Button>
          <Button onClick={() => navigate("/")} sx={{ width: 100 }}>
            취소
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default Write;
