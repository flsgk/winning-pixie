import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addPostToFirebase } from "../redux/postsSlice";

function Write() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // URL의 쿼리 파라미터에서 날짜 가져오기
  const urlParmas = new URLSearchParams(window.location.search);
  const initialDate = urlParmas.get("date") || "";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [playDate, setPlayDate] = useState(initialDate); // 날짜 기본 값 설정

  const handleSave = (e) => {
    e.preventDefault();
    const newPost = {
      title,
      content,
      playDate,
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
          <p>내용</p>
          <textarea
            value={content}
            name="content"
            cols={50}
            rows={30}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
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
        <div>
          <button onClick={handleSave}>저장</button>
          <button onClick={() => navigate("/")}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default Write;
