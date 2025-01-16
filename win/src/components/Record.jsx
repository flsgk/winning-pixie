import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale"; // date-fns에서 한국어 로케일 가져오기
import "./CSS/DatePicker.css";

import { database } from "../firebase";
import { ref, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill 기본 스타일
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";

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

const Record = ({ selectedTeam }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gameInfo, setGameInfo] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [text, setText] = useState("");
  const [userId, setUserId] = useState(null);
  const quillRef = useRef(null);
  const navigate = useNavigate();

  // AWS S3 설정
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  const s3 = new AWS.S3();

  // 이미지 업로드 함수
  const uploadToS3 = async (file) => {
    const params = {
      Bucket: "winning-pixie-test", // S3 버킷 이름
      Key: `images/${file.name}`, // 업로드될 경로 (예: images/myImage.jpg)
      Body: file,
      ContentType: file.type, // 파일 MIME 타입
      ACL: "public-read", // 퍼블릭 읽기 권한
    };
    console.log("Uploading file to S3", params); // 로그 추가

    try {
      const data = await s3.upload(params).promise();
      console.log("File uploaded successfully:", data); // 업로드 성공 로그
      return data.Location; // 업로드된 이미지 URL 반환
    } catch (error) {
      console.error("파일 업로드 실패:", error); // 실패 로그
      return null;
    }
  };

  // 이미지 삽입을 위한 custom handler
  const handleImage = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // S3에 파일 업로드
        const imageUrl = await uploadToS3(file);
        if (imageUrl) {
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            quill.insertEmbed(range.index, "image", imageUrl);
          }
        }
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ["bold", "italic", "underline"],
          ["link", "image"], // 이미지 버튼
        ],
        handlers: {
          image: handleImage, // 이미지 버튼 클릭 시 호출될 함수
        },
      },
    }),
    []
  );

  // Firebase에서 로그인 된 사용자 ID 가져오기
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    } else {
      console.log("로그인되지 않은 사용자");
    }
  }, []);

  const saveRecord = async () => {
    if (!userId) {
      alert("로그인된 사용자가 아닙니다.");
      return;
    }

    if (!gameInfo) {
      alert("저장할 경기 정보가 없습니다.");
      return;
    }

    if (!selectedLocation) {
      alert("장소를 선택해 주세요.");
      return;
    }

    const recordData = {
      date: gameInfo.date,
      location: selectedLocation,
      team: selectedTeam,
      opponent: gameInfo.opponent,
      score1: gameInfo.myScore,
      score2: gameInfo.oppScore,
      result: getGameResult(gameInfo.myScore, gameInfo.oppScore),
      diary: text,
    };

    try {
      const recordRef = ref(
        database,
        `users/${userId}/records/${selectedTeam}/${gameInfo.date}`
      );
      await set(recordRef, recordData);
      alert("기록이 저장되었습니다!");
      navigate("/my-page");
    } catch (error) {
      console.error("Error saving record:", error);
      alert("기록 저장 중 오류가 발생했습니다.");
    }
  };

  // 날짜 선택 시 데이터를 필터링하는 함수
  const fetchGameForDate = async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    console.log(`Fetching game for: ${year}-${month}-${day}`);

    try {
      const data = await fetchGameData(year, month, selectedTeam);
      console.log("Fetched data:", data);

      // 선택한 날짜의 경기 필터링
      const filteredGame = data.find(
        (game) =>
          (game.team1 === selectedTeam || game.team2 === selectedTeam) &&
          parseInt(game.date, 10) === day // 날짜 비교 시 숫자 변환
      );

      if (filteredGame) {
        const isTeam1 = filteredGame.team1 === selectedTeam;

        setGameInfo({
          opponent: isTeam1 ? filteredGame.team2 : filteredGame.team1,
          myScore: isTeam1
            ? parseInt(filteredGame.score1, 10)
            : parseInt(filteredGame.score2, 10),
          oppScore: isTeam1
            ? parseInt(filteredGame.score2, 10)
            : parseInt(filteredGame.score1, 10),

          date: `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`,
        });
        setText("");
      } else {
        setGameInfo(null);
        setText("");
      }
    } catch (error) {
      console.error("Error fetching game for date:", error);
    }
  };

  // 날짜 변경 시 경기 데이터 가져오기
  useEffect(() => {
    fetchGameForDate(selectedDate);
  }, [selectedDate]);

  const getGameResult = (myScore, oppScore) => {
    if (myScore > oppScore) return "승";
    if (myScore < oppScore) return "패";
    return "무";
  };

  return (
    <Stack>
      <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
        직관 기록하기
      </Typography>

      <Divider />
      <Box sx={{ width: 700, marginTop: 4 }}>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy년 MM월 dd일 (eee)"
          locale={ko}
          inline // 이 부분 수정
        />

        <Stack spacing={2} sx={{ flexGrow: 1, marginTop: 4, marginBottom: 4 }}>
          {gameInfo ? (
            <Card>
              <Stack direction="row" spacing={2}>
                <Stack spacing={1} sx={{ flexGrow: 1 }}>
                  <FormLabel>날짜</FormLabel>
                  <Input value={gameInfo.date} />
                </Stack>

                <Stack spacing={1} sx={{ flexGrow: 1 }}>
                  <FormLabel>장소</FormLabel>

                  <Select
                    value={selectedLocation}
                    onChange={(event, newValue) =>
                      setSelectedLocation(newValue)
                    }
                    placeholder="장소 선택"
                  >
                    <Option value="서울 잠실(두산)">서울 잠실(두산)</Option>
                    <Option value="서울 잠실(LG)">서울 잠실(LG)</Option>
                    <Option value="서울 고척">서울 고척</Option>
                    <Option value="광주 챔필">광주 챔필</Option>
                    <Option value="대구 라팍">대구 라팍</Option>
                    <Option value="부산 사직">부산 사직</Option>
                    <Option value="대전 이팍">대전 이팍</Option>
                    <Option value="창원 엔팍">창원 엔팍</Option>
                    <Option value="인천 랜필">인천 랜필</Option>
                    <Option value="수원 위팍">수원 위팍</Option>
                  </Select>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Stack spacing={1}>
                  <FormLabel>경기 결과</FormLabel>
                </Stack>
                <Stack spacing={1}>
                  <Input
                    value={getGameResult(gameInfo.myScore, gameInfo.oppScore)}
                    sx={{
                      width: 50,
                    }}
                  />
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Stack spacing={1}>
                  <FormLabel>응원 팀</FormLabel>
                </Stack>
                <Stack spacing={1}>
                  <Input
                    value={selectedTeam}
                    sx={{
                      width: 100,
                    }}
                  />
                </Stack>
                <Stack spacing={1}>
                  <Input
                    type="number"
                    sx={{
                      width: 100,
                    }}
                    placeholder="응원 팀"
                    value={gameInfo.myScore} // 응원 팀 점수
                  />
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Stack spacing={1}>
                  <FormLabel>상대 팀</FormLabel>
                </Stack>
                <Stack spacing={1}>
                  <Input
                    value={gameInfo.opponent}
                    sx={{
                      width: 100,
                    }}
                  />
                </Stack>
                <Stack spacing={1}>
                  <Input
                    type="number"
                    sx={{
                      width: 100,
                    }}
                    placeholder="상대 팀"
                    value={gameInfo.oppScore} // 상대 팀 점수
                  />
                </Stack>
              </Stack>
              <Box>
                <FormControl>
                  <FormLabel>직관 일기</FormLabel>

                  <ReactQuill
                    value={text}
                    onChange={setText} // 상태 업데이트
                    ref={quillRef}
                    modules={modules} // 모듈에 설정된 툴바 적용
                  />
                </FormControl>
              </Box>

              <Button onClick={saveRecord}>저장</Button>
            </Card>
          ) : (
            <Typography>선택된 날짜에 경기가 없습니다.</Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );
};

export default Record;
