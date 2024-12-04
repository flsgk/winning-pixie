import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchSchedule } from "../api/scheduleApi";

function Schedule({ selectedTeam }) {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedTeam) {
      const year = 2024;
      const month = 4; // 예제: 4월
      fetchSchedule(year, month, selectedTeam)
        .then((data) => {
          // 이벤트 포맷으로 변환
          const formattedEvents = data.map((game) => ({
            title: `${game.team1} vs ${game.team2}`,
            start: `2024-04-${game.date.padStart(2, "0")}`, // 날짜 형식 맞추기
          }));
          setEvents(formattedEvents);
        })
        .catch(() => {
          setError("일정을 불러오는 데 실패했습니다.");
        });
    }
  }, [selectedTeam]);

  return (
    <div>
      <h2>{selectedTeam} 경기 일정</h2>
      {error && <p>{error}</p>}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale="ko" // 한국어로 표시
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        eventClick={(info) => alert(info.event.title)} // 이벤트 클릭 시 제목 표시
      />
    </div>
  );
}

export default Schedule;
