export const fetchSchedule = (year, month, team) => {
  const apiUrl = `http://localhost:5001/api/schedule?year=${year}&month=${month}&team=${team}`;
  console.log(apiUrl);

  return fetch(apiUrl) // Fetch를 사용하면 Promise를 반환
    .then((response) => {
      if (!response.ok) {
        throw new Error("API 요청 실패");
      }
      return response.json(); // JSON 응답 변환
    })
    .catch((error) => {
      console.error("API 호출 오류:", error);
      throw error; // 호출 측으로 전달
    });
};
