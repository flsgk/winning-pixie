import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CSS/Schedule.css";
import { Box } from "@mui/joy";

const teamColors = {
  두산: "#032070",
  롯데: "#D42D48",
  LG: "#C00C3F",
  NC: "#012B69",
  KT: "#000000",
  SSG: "#CF152D",
  KIA: "#ED1C24",
  키움: "#860020",
  한화: "#F37321",
  삼성: "#0261AA",
};

// API 호출 함수
const fetchSchedule = async (year, month, team) => {
  const apiUrl = `http://localhost:5001/api/schedule?year=${year}&month=${month}&team=${team}`;
  try {
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

function Schedule({ selectedTeam, onEventClick }) {
  const [events, setEvents] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState(null);

  // 이벤트 클릭 핸들러
  const handleEventClick = (eventInfo) => {
    const selectedEvent = eventInfo.event; // 클릭한 이벤트
    const selectedTeams = selectedEvent.title.split(" vs ");
    console.log("Clicked Event:", selectedEvent);
    console.log("Teams on Clicked Event:", selectedTeams);

    // 이벤트 클릭 시 글 목록을 보여주는 함수 호출
    onEventClick({
      teams: selectedTeams, // 팀 이름을 전달
      date: selectedEvent.startStr, // 클릭한 날짜를 전달
    });
  };

  const updateEvents = async (year, month) => {
    try {
      console.log(
        `Fetching schedule for ${year}-${month} and team: ${selectedTeam}`
      );
      const data = await fetchSchedule(year, month, selectedTeam);
      console.log("Fetched data:", data); // 추가: 데이터 확인

      // 경기 데이터를 필터링하여 선택된 팀의 경기만 표시
      const filteredGames = data.filter(
        (game) => game.team1 === selectedTeam || game.team2 === selectedTeam
      );

      const formattedEvents = filteredGames.map((game) => {
        let event = {
          title: `${game.team1} vs ${game.team2}`,
          start: `${year}-${String(month).padStart(2, "0")}-${String(
            game.date
          ).padStart(2, "0")}`, // YYYY-MM-DD
        };

        // 상대 팀의 색상 적용
        if (game.team1 === selectedTeam) {
          // team2의 색상 적용
          event.backgroundColor = teamColors[game.team2] || "#000";
          event.borderColor = teamColors[game.team2] || "#000";
        } else if (game.team2 === selectedTeam) {
          // team1의 색상 적용
          event.backgroundColor = teamColors[game.team1] || "#000";
          event.borderColor = teamColors[game.team1] || "#000";
        }

        return event;
      });

      console.log("Formatted events with opponent colors:", formattedEvents);

      // 상태 업데이트
      setEvents(formattedEvents);
    } catch (err) {
      setError("Failed to load schedule");
    }
  };

  const handleEventMouseEnter = (info) => {
    info.el.style.opacity = "0.8";
    info.el.style.cursor = "pointer"; // 커서를 포인터로 변경
  };

  const handleEventMouseLeave = (info) => {
    info.el.style.opacity = "1";
    info.el.style.cursor = ""; // 커서를 포인터로 변경
  };

  useEffect(() => {
    if (!selectedTeam) return;
    // 초기 로드 시 현재 월의 데이터를 가져오도록
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    updateEvents(year, month);
  }, [currentMonth, selectedTeam]);

  const handleDatesSet = (dateInfo) => {
    const currentDate = dateInfo.view.calendar.getDate();
    const newMonth = currentDate.getMonth() + 1;
    const newYear = currentDate.getFullYear();
    console.log(`New month: ${newYear}-${newMonth}`);
    setCurrentMonth(new Date(newYear, newMonth - 1));
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Box>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dayCellClassNames="custom-day-cell"
          events={events}
          locale="ko"
          headerToolbar={{
            left: "title",
            right: "prev,next today",
          }}
          datesSet={handleDatesSet}
          eventClick={handleEventClick} // 이벤트 클릭 핸들러 추가
          width="100%" // 달력의 너비를 100%로 설정하여 가득 차게 함
          contentHeight="480px" // 달력 높이를 고정하여 6줄 이상 나오지 않도록 설정
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
        />
      </Box>
    </div>
  );
}

export default Schedule;
