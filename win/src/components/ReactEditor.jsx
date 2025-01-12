import { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css"; //React Quill 기본 테마
import "./CSS/ReactEditor.css";

const ReactEditor = ({ value, onChange, modules }) => {
  // 툴바에 표시할 모듈 설정
  const defaultModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      [{ font: [] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["image"],
    ],
  };

  return (
    <>
      <ReactQuill
        className="custom-editor"
        value={value}
        onChange={onChange}
        theme="snow"
        modules={modules || defaultModules}
        placeholder="내용을 입력하세요...."
        style={{ width: 700, height: 300 }}
      />
    </>
  );
};

export default ReactEditor;
