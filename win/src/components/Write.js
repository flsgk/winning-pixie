import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Write() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [playDate, setPlayDate] = useState();
  const [savedPost, setSavedPost] = useState();

  return (
    <div>
      <form>
        <div>
          <p>제목</p>
          <input
            type="text"
            name="title"
            value={title}
            onChange={changeHandler}
          />
        </div>
        <br />
        <div>
          <p>내용</p>
          <input
            type="text"
            name="content"
            value={content}
            onChange={changeHandler}
          />
        </div>
        <br />
        <div>
          <p>경기 날짜</p>
          <input
            type="date"
            name="playDate"
            value={playDate}
            onChange={changeHandler}
          />
        </div>
        <div>
          <button>저장</button>
          <button>취소</button>
        </div>
      </form>
    </div>
  );
}

export default Write;
