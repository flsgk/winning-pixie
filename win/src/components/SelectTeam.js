import { useNavigate } from "react-router-dom";
import { auth, database } from "../firebase"; // Firebase 설정 가져오기
import { ref, set, update } from "firebase/database"; // 데이터베이스에 데이터를 저장하기 위해 필요
import Button from "@mui/joy/Button";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Typography from "@mui/joy/Typography";
import { useState } from "react";

const teams = [
  { fullName: "두산 베어스", shortName: "두산", color: "#032070" }, // 팀 색상 추가
  { fullName: "LG 트윈스", shortName: "LG", color: "#C00C3F" },
  { fullName: "한화 이글스", shortName: "한화", color: "#F37321" },
  { fullName: "삼성 라이온즈", shortName: "삼성", color: "#0261AA" },
  { fullName: "KIA 타이거즈", shortName: "KIA", color: "#ED1C24" },
  { fullName: "롯데 자이언츠", shortName: "롯데", color: "#D42D48" },
  { fullName: "NC 다이노스", shortName: "NC", color: "#012B69" },
  { fullName: "키움 히어로즈", shortName: "키움", color: "#860020" },
  { fullName: "SSG 랜더스", shortName: "SSG", color: "#CF152D" },
  { fullName: "KT 위즈", shortName: "KT", color: "#000000" },
];

function SelectTeam() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    console.log("Team Selected:", team);
  };

  const handleConfirm = async () => {
    if (selectedTeam) {
      // firebase에 선택된 팀 정보 저장하기
      const userId = auth.currentUser.uid;
      const userRef = ref(database, `users/${userId}`);

      try {
        await update(userRef, {
          selectedTeam: selectedTeam.shortName,
        });
        // 홈 화면으로 이동
        navigate("/");
      } catch (error) {
        console.error("팀 저장 실패 :", error);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // 세로 중앙 정렬
        alignItems: "center", // 가로 중앙 정렬
        height: "100vh", // 화면 전체 높이 사용
      }}
    >
      <Typography
        level="h2"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        어떤 팀을 응원하시나요?
      </Typography>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)", // 5개의 버튼을 균등하게 배치
          gridRowGap: "10px", // 세로 간격
          gridColumnGap: "0px", // 버튼 간격 좁히기
          padding: "0 30px", // 그리드의 좌우 여백을 동일하게 설정
          justifyItems: "center", // 버튼을 그리드 내에서 가로로 중앙 정렬
          width: "70%", // 그리드의 너비를 100%로 설정
        }}
      >
        {teams.map(
          (
            team,
            index // teams 배열을 순회하며 각 팀 이름에 대해서 하나의 버튼을 생성한다.
          ) => (
            <Button
              key={index}
              onClick={() => handleSelectTeam(team)}
              className={`button ${
                selectedTeam?.shortName === team.shortName ? "selected" : ""
              }`}
              sx={{
                backgroundColor:
                  selectedTeam?.shortName === team.shortName
                    ? team.color
                    : team.color,
                color: selectedTeam?.shortName === team.shortName ? "#fff" : "",
                ":focus": {
                  outline: "3px solid #424242",
                  outlineOffset: "2px",
                },
                marginBottom: "10px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // 그림자 추가
                ":hover": {
                  backgroundColor:
                    selectedTeam?.shortName === team.shortName
                      ? team.color
                      : team.color, // 호버 시 색상 변경 방지
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)", // 호버 시 그림자 강조
                },
                width: "150px", // 버튼 너비 줄이기 (좌우 마진을 고려하여 줄임)
                height: "55px", // 버튼 높이
                fontSize: "16px", // 글자 크기
                borderRadius: "10px",
              }}
            >
              {team.fullName}
            </Button>
          )
        )}
      </div>
      <Button
        startDecorator={<FavoriteBorder />}
        className="this-team"
        onClick={handleConfirm}
        disabled={!selectedTeam}
        color="neutral"
        sx={{
          marginTop: "24px",
        }}
      >
        응원하기
      </Button>
    </div>
  );
}

export default SelectTeam;
