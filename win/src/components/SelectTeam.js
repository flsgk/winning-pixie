import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../firebase"; // Firebase 설정 가져오기
import { ref, set, update } from "firebase/database"; // 데이터베이스에 데이터를 저장하기 위해 필요
import "./CSS/SelectTeam.css";

const teams = [
  { fullName: "두산 베어스", shortName: "두산" },
  { fullName: "LG 트윈스", shortName: "LG" },
  { fullName: "한화 이글스", shortName: "한화" },
  { fullName: "삼성 라이온즈", shortName: "삼성" },
  { fullName: "KIA 타이거즈", shortName: "KIA" },
  { fullName: "롯데 자이언츠", shortName: "롯데" },
  { fullName: "NC 다이노스", shortName: "NC" },
  { fullName: "키움 히어로즈", shortName: "키움" },
  { fullName: "SSG 랜더스", shortName: "SSG" },
  { fullName: "KT 위즈", shortName: "KT" },
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
    <div className="container">
      <p className="what-team">어떤 팀을 응원하시나요?</p>
      {selectedTeam && (
        <p className="my-team">나의 팀 : {selectedTeam.fullName}</p>
      )}
      <div className="grid-container">
        {teams.map(
          (
            team,
            index // teams 배열을 순회하며 각 팀 이름에 대해서 하나의 버튼을 생성한다.
          ) => (
            <button
              key={index}
              onClick={() => handleSelectTeam(team)}
              className={`button ${selectedTeam === team ? "selected" : ""}`}
            >
              {team.fullName}
            </button>
          )
        )}
      </div>
      <button
        className="this-team"
        onClick={handleConfirm}
        disabled={!selectedTeam}
      >
        응원하기
      </button>
    </div>
  );
}

export default SelectTeam;
