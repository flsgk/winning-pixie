import {
  Button,
  Select,
  Option,
  Box,
  CardContent,
  Card,
  Typography,
  CardOverflow,
  ButtonGroup,
  Stack,
  Divider,
} from "@mui/joy";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, getDatabase, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function WinningRate({ selectedTeam, date }) {
  const [userId, setUserId] = useState(null);
  const [winningRate, setWinningRate] = useState(0);
  const initialYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Firebase 인증 상태를 확인하여 userId 설정
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log("로그인되지 않은 사용자");
      }
    });
    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 제거
  }, []);

  // firebase 에서 유저의 기록 가져오기
  useEffect(() => {
    const fetchUserRecords = async () => {
      if (!userId || !selectedTeam) return; // userId와 selectedTeam이 필요함

      const db = getDatabase();
      const recordsRef = ref(db, `users/${userId}/records/${selectedTeam}/`);

      try {
        const snapshot = await get(recordsRef);
        if (snapshot.exists()) {
          console.log("Fetched First Records:", snapshot.val());
          // 가져온 데이터를 활용
          const records = snapshot.val();

          // 선택된 연도 기준으로 필터링
          const filteredRecords = Object.values(records).filter((record) => {
            const recordYear = record.date.split("-")[0];
            return recordYear === selectedYear.toString();
          });

          setRecords(filteredRecords); // 직관 기록 상태 업데이트

          const totalGames = filteredRecords.length;
          const totalWins = filteredRecords.filter(
            (record) => record.result === "승"
          ).length;

          setWinningRate(totalGames > 0 ? (totalWins / totalGames) * 100 : 0);
        } else {
          console.log("No records found");
        }
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
      }
    };

    fetchUserRecords();
  }, [userId, selectedTeam, selectedYear]);

  const handleClick = (recordDate) => {
    const path = `users/${userId}/records/${selectedTeam}/${recordDate}`;
    navigate(`/${path}`);
  };

  return (
    <Stack>
      <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
        나의 직관기록
      </Typography>
      <Divider />
      <Button
        onClick={() => navigate("/record")}
        sx={{
          mt: 4,
          width: "150px",
        }}
      >
        직관 기록하기
      </Button>

      <Typography
        level="h5"
        fontWeight="bold"
        sx={{
          marginTop: 2,
        }}
      >{`🏆 ${selectedYear}: ${winningRate.toFixed(2)}%`}</Typography>

      <ButtonGroup spacing="3px">
        <Button
          onClick={() => handleYearChange(2024)}
          color="neutral"
          variant={selectedYear === 2024 ? "solid" : "outlined"}
          sx={{
            borderRadius: "20px",
          }}
        >
          24 시즌
        </Button>
        <Button
          onClick={() => handleYearChange(2025)}
          color="neutral"
          variant={selectedYear === 2025 ? "solid" : "outlined"}
          sx={{
            borderRadius: "20px",
          }}
        >
          25 시즌
        </Button>
      </ButtonGroup>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 5,
        }}
      >
        {records.map((record, index) => (
          <Card
            key={index}
            orientation="horizontal"
            sx={{
              width: 250,
              height: 60,
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => handleClick(record.date)}
          >
            <CardOverflow
              variant="soft"
              color={
                record.result === "승"
                  ? "success"
                  : record.result === "패"
                  ? "danger"
                  : "neutral"
              }
              sx={{
                px: 0.4,
                writingMode: "vertical-rl",
                justifyContent: "center",
                fontSize: "s",
                fontWeight: "xl",
                letterSpacing: "1px",
                textTransform: "uppercase",
                borderLeft: "1px solid",
                borderColor: "divider",
              }}
            >
              {`${record.result}`}
            </CardOverflow>
            <CardContent>
              <Typography level="body-sm">{`${record.date}`}</Typography>
              <Typography level="body-sm" color="text.secondary">
                {` ${record.location}`}
              </Typography>
              <Typography level="body-sm">{`vs ${record.opponent}`}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

export default WinningRate;
