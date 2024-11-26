import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectTeam.css";

const teams = [
  "두산 베어스",
  "LG 트윈스",
  "한화 이글스",
  "삼성 라이온즈",
  "KIA 타이거즈",
  "롯데 자이언츠",
  "NC 다이노스",
  "키움 히어로즈",
  "SSG 랜더스",
  "KT 위즈",
];

function SelectTeam() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
  };

  const handleConfirm = () => {
    if (SelectTeam) {
      localStorage.setItem("selectedTeam", selectedTeam);
      navigate("/");
    }
  };

  return (
    <div className="container">
      <p className="what-team">어떤 팀을 응원하시나요?</p>
      {selectedTeam && <p className="my-team">나의 팀 : {selectedTeam}</p>}
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
              {team}
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
