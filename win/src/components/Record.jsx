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
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { el, ko } from "date-fns/locale"; // date-fns에서 한국어 로케일 가져오기
import "./CSS/DatePicker.css";

import { database } from "../firebase";
import { ref, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useLocation } from "react-router-dom";

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
      } else {
        setGameInfo(null);
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
        내 직관기록
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
              <FormControl>
                <FormLabel>직관 일기</FormLabel>
                <Textarea
                  minRows={2}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  sx={{
                    width: 500,
                  }}
                />
              </FormControl>

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
