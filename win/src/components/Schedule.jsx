import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Schedule.css";

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

function Schedule({ selectedTeam }) {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState(null);

  const updateEvents = async (year, month) => {
    try {
      console.log(
        `Fetching schedule for ${year}-${month} and team: ${selectedTeam}`
      );
      const data = await fetchSchedule(year, month, selectedTeam);
      console.log("Fetched data:", data); // 추가: 데이터 확인
      const formattedEvents = data.map((game) => ({
        title: `${game.team1} vs ${game.team2}`,
        start: `${year}-${String(month).padStart(2, "0")}-${String(
          game.date
        ).padStart(2, "0")}`, // YYYY-MM-DD
      }));
      console.log("Formatted events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (err) {
      setError("Failed to load schedule");
    }
  };

  useEffect(() => {
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
      <h2>{selectedTeam} 경기 일정</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale="ko"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth, dayGridWeek",
        }}
        datesSet={handleDatesSet}
      />
    </div>
  );
}

export default Schedule;
