import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addPost } from "../redux/postsSlice";

function Write() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [playDate, setPlayDate] = useState("");

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  const handleDateChange = (e) => {
    setPlayDate(e.target.value);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now(), // 고유 ID
      title,
      content,
      playDate,
    };
    dispatch(addPost(newPost)); // Redux store에 글 추가
    navigate("/");
  };

  const handleCancel = () => {
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
            onChange={handleTitleChange}
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
            onChange={handleContentChange}
          ></textarea>
        </div>
        <br />
        <div>
          <p>경기 날짜</p>
          <input
            type="date"
            name="playDate"
            value={playDate}
            onChange={handleDateChange}
          />
        </div>
        <div>
          <button onClick={handleSave}>저장</button>
          <button onClick={handleCancel}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default Write;
