import React, { useEffect, useState } from "react";
import { fetchSchedule } from "../api/scheduleApi";

function Schedule({ selectedTeam }) {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Selected team:", selectedTeam);
    if (selectedTeam) {
      const year = 2024;
      const month = 5;

      // 선택된 팀에 맞는 일정만 찾아오기
      fetchSchedule(year, month, selectedTeam)
        .then((data) => {
          setSchedule(data);
        })
        .catch((err) => {
          setError("일정을 불러오는 데 실패했습니다.");
        });
    }
  }, [selectedTeam]);

  return (
    <div>
      <p>{selectedTeam}</p>
      {error && <p>{error}</p>}
      <ul>
        {schedule.length === 0 ? (
          <li>경기 일정이 없습니다.</li>
        ) : (
          schedule.map((game, index) => (
            <li key={index}>
              {game.date} : {game.team1} vs {game.team2}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Schedule;
