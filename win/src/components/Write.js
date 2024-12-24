import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addPostToFirebase } from "../redux/postsSlice";
import FormLabel from "@mui/joy/FormLabel";
import ReactEditor from "./ReactEditor";

function Write() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // URL의 쿼리 파라미터에서 날짜, 팀 정보 가져오기
  // URL에서 쿼리 파라미터 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const initialDate = urlParams.get("date") || "";
  const initialTeams = urlParams.get("teams")
    ? urlParams.get("teams").split(",")
    : []; // 전달받은 팀 목록을 분리

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [playDate, setPlayDate] = useState(initialDate); // 날짜 기본 값 설정
  const [teams, setTeams] = useState([...initialTeams, "기타"]); // '기타' 추가
  const [selectedTeam, setSelectedTeam] = useState(""); // 사용자가 선택한 팀 저장

  console.log(teams); // teams 배열을 확인하여 정상적으로 팀들이 전달되는지 확인

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      alert("응원 구단을 선택하세요.");
      return;
    }

    // 현재 날짜를 ISO 형식으로 저장 (작성일)
    const createdDate = new Date().toLocaleDateString("ko-KR");

    const newPost = {
      title,
      content,
      playDate,
      team: selectedTeam,
      createdDate,
    };
    dispatch(addPostToFirebase(newPost)); // Redux store에 글 추가
    navigate("/");
  };

  return (
    <div>
      <form>
        <div>
          <p>제목</p>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <br />
        <div>
          <FormLabel>내용</FormLabel>
          <ReactEditor value={content} onChange={setContent} />
        </div>
        <br />
        <div>
          <p>경기 날짜</p>
          <input
            type="date"
            name="playDate"
            value={playDate}
            onChange={(e) => setPlayDate(e.target.value)}
          />
        </div>
        <br />
        <div>
          <p>응원구단 선택</p>
          <select
            name="selectedTeam"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">선택</option>
            {teams.map((team, index) => (
              <option key={index} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={handleSave}>저장</button>
          <button onClick={() => navigate("/")}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default Write;
