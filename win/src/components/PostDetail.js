import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase";
import { getAuth } from "firebase/auth";
import "./CSS/PostDetail.css";

function PostDetail() {
  const { id } = useParams(); // URL에서 ID 가져오기
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false); // 모달폼 표시 상태
  const [formData, setFormData] = useState({
    nickname: "",
    contact: "",
    memo: "",
  });
  const [applicationStatus, setApplicationStatus] = useState(""); // 폼 제출 상태
  const auth = getAuth();

  useEffect(() => {
    // 현재 사용자 정보 가져오기 (닉네임)
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setFormData((prevData) => ({
              ...prevData,
              nickname: userData.nickname || "", // nickname 사용
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }

    const postRef = ref(database, `posts/${id}`); // posts 밑에 해당 ID 경로
    get(postRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("Post data:", snapshot.val()); // 데이터 가져오기 확인
          setPost(snapshot.val());
        } else {
          console.log("No data found for this ID");
          setPost(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching post data:", error);
      })
      .finally(() => setLoading(false));
  }, [id, auth]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nickname, contact, memo } = formData;
    if (!nickname || !contact || !memo) {
      setApplicationStatus("모든 필드를 입력해주세요.");
      return;
    }
    const postRef = ref(database, `posts/${id}`);
    const updates = {};
    const applicantId = `${nickname}_${Date.now()}`;

    // 신청자 정보 추가
    updates[`/applicants/${applicantId}`] = {
      nickname,
      contact,
      memo,
      status: "pending",
    };

    update(postRef, updates)
      .then(() => {
        setApplicationStatus("신청이 완료되었습니다!");
        setApplying(false); // 폼 숨기기
      })
      .catch((error) => {
        console.error("Error submitting application:", error);
        setApplicationStatus("신청 실패. 다시 시도해주세요.");
      });
  };

  if (loading) return <p>로딩 중...</p>;
  if (!post) return <p>글을 찾을 수 없습니다.</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>작성일: {post.createdDate}</p>
      <p>경기 날짜: {post.playDate}</p>
      <p>팀: {post.team}</p>

      {/* 참여하기 버튼 */}
      {!applying && <button onClick={() => setApplying(true)}>참여하기</button>}

      {/* 모달 */}
      {applying && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={() => setApplying(false)}>
              &times;
            </button>
            <h4>참여 신청</h4>
            <form onSubmit={handleSubmit}>
              <div>
                <label>닉네임</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div>
                <label>연락처</label>
                <input
                  type="number"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="연락처를 입력하세요"
                />
              </div>
              <div>
                <label>메모</label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleChange}
                  placeholder="메모를 입력하세요"
                />
              </div>
              <button type="submit">신청하기</button>
            </form>
            {applicationStatus && <p>{applicationStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;
