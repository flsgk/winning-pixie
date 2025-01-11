import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { get, onValue, ref, update } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPosts } from "../redux/postsSlice";
import {
  Box,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Option,
  Select,
  Button,
} from "@mui/joy";
import ReactEditor from "./ReactEditor";
import GoBackButton from "./GoBackButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";

// api 호출 함수
const fetchGameData = async (year, month, team) => {
  const apiUrl = `http://localhost:5001/api/schedule?year=${year}&month=${month}&team=${team}`;
  try {
    console.log("Fetching data from API:", apiUrl); // API URL 출력
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch schedule");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }
};

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gameInfo, setGameInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    authorNickname: "",
    content: "",
    createdDate: "",
    myTeam: "",
    playDate: "",
    title: "",
    uid: "",
    yourTeam: "",
  });

  // 게시물 정보 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postRef = ref(database, `posts/${id}`);
        const snapshot = await get(postRef);

        if (snapshot.exists()) {
          const postData = snapshot.val();
          setFormData(postData);
        } else {
          console.error("사용자 데이터를 찾을 수 없습니다.");
        }
        setLoading(false);
      } catch (error) {
        console.error("사용자 데이터 로드 실패:", error.message);
      }
    };
    fetchPosts();
  }, [id]);

  useEffect(() => {
    if (formData.playDate && formData.myTeam && formData.yourTeam) {
      fetchGameForDate();
    }
  }, [formData.playDate, formData.myTeam, formData.yourTeam]);
  // 로딩 상태 처리
  if (loading) {
    return <p>로딩 중...</p>; // 로딩 중일 때 문구 표시
  }

  console.log("formdata", formData);

  // 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };
  const handleSave = async () => {
    const updatedFormData = {
      ...formData,
      updatedDate: new Date().toLocaleDateString("ko-KR"),
    };

    await updatePost(updatedFormData);
    return;
  };

  // 게시물 수정 업데이트
  const updatePost = async (updatedFormData) => {
    try {
      const postRef = ref(database, `posts/${id}`);
      await update(postRef, updatedFormData);
      alert("게시물이 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("게시물 수정 실패:", error.message);
      alert("게시물 수정에 실패했습니다.");
    }
  };

  // 날짜 선택 시 데이터를 필터링하는 함수
  const fetchGameForDate = async () => {
    // playDate를 Date 객체로 변환
    const playDate = new Date(formData.playDate); // "2024-10-25" 형태로 들어오는 문자열을 Date 객체로 변환

    // Date 객체에서 year, month, day 추출
    const year = playDate.getFullYear();
    const month = playDate.getMonth() + 1; // getMonth는 0부터 시작하므로 1을 더해야 함
    const day = playDate.getDate();

    console.log(`Fetching game for: ${year}-${month}-${day}`);

    try {
      const data = await fetchGameData(year, month, formData.myTeam);
      console.log("Fetched data:", data);

      // 선택한 날짜의 경기 필터링
      const filteredGame = data.find(
        (game) =>
          (game.team1 === formData.myTeam) | (game.team2 === formData.myTeam) &&
          parseInt(game.date, 10) === day // 날짜 비교 시 숫자 변환
      );

      if (filteredGame) {
        const isTeam1 = filteredGame.team1 === formData.myTeam;

        setGameInfo({
          opponent: isTeam1 ? filteredGame.team2 : filteredGame.team1,
          date: `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`,
        });
      } else {
        setGameInfo(null);
      }
    } catch (error) {
      console.error("Error fetching game for date:", error);
    }
  };

  // gameInfo 확인용 콘솔 로그 추가
  console.log("gameInfo 상태:", gameInfo);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column", // 필요시 세로 방향 정렬
        justifyContent: "flex-start", // 상단부터 정렬
        alignItems: "center",
        width: 800, // 박스 너비
        height: "100vh", // 뷰포트 전체 높이를 보장
        position: "absolute", // 위치 설정
        top: "50%", // 화면 상단에서 50% 아래로
        transform: "translateY(-50%)", // 정확히 화면 세로 중앙으로 이동
        boxSizing: "border-box", // padding을 포함한 크기 계산
      }}
    >
      <GoBackButton />

      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        <Stack spacing={1}>
          <FormLabel>글 제목</FormLabel>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder=""
            sx={{ width: 700 }}
          />
          <FormHelperText>
            {" "}
            {new Date(formData.playDate).toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
            })}
            의 승리요정을 찾는 게시물을 작성해주세요.
          </FormHelperText>
        </Stack>

        <Stack spacing={1}>
          <FormLabel>내용</FormLabel>
          <ReactEditor value={formData.content} onChange={handleChange} />
        </Stack>

        <Stack spacing={1}>
          <FormLabel>경기 날짜</FormLabel>
          <Input
            type="date"
            value={formData.playDate}
            onChange={handleInputChange}
            sx={{ width: 300 }}
            disabled
          />
        </Stack>

        <Stack spacing={1}>
          <FormLabel>어떤 팀을 웅원하나요?</FormLabel>
          <Select
            value={formData.myTeam} // 초기값 설정
            onChange={(e, value) =>
              setFormData((prev) => ({ ...prev, myTeam: value }))
            }
            startDecorator={<FavoriteBorder />}
            sx={{ width: 300 }}
            placeholder="선택"
          >
            <Option value={formData.myTeam}>{formData.myTeam}</Option>{" "}
            {/* 기타 옵션 */}
          </Select>
        </Stack>

        <Stack spacing={1}>
          <FormLabel>어떤 팀의 요정과 함께 하고 싶나요?</FormLabel>
          <Select
            name="yourTeam"
            value={formData.yourTeam} // 초기값 설정
            onChange={(e, value) =>
              setFormData((prev) => ({ ...prev, yourTeam: value }))
            }
            startDecorator={<FavoriteBorder />}
            sx={{ width: 300 }}
            placeholder="선택"
          >
            <Option value={formData.myTeam}>{formData.myTeam}</Option>
            {/* 첫 번째 팀 */}
            {gameInfo && gameInfo.opponent ? (
              <Option value={gameInfo.opponent}>{gameInfo.opponent}</Option>
            ) : null}
            {/* 두 번째 팀 */}
            <Option value="기타">기타</Option> {/* 기타 옵션 */}
          </Select>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button onClick={handleSave} sx={{ width: 100 }}>
            저장
          </Button>
          <Button onClick={() => navigate(`/post/${id}`)} sx={{ width: 100 }}>
            취소
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EditPost;
