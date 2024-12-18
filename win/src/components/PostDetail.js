import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ref, get, update, onValue } from "firebase/database";
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
  const [applicants, setApplicants] = useState([]); // 신청자 목록 상태 관리

  useEffect(() => {
    // 현재 사용자 정보 가져오기 (닉네임)
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setFormData((prevData) => ({
            ...prevData,
            nickname: userData.nickname || "", // nickname 사용
          }));
        }
      });
    }

    const postRef = ref(database, `posts/${id}`); // posts 밑에 해당 ID 경로
    const unsubscribe = onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const postData = snapshot.val();
        setPost(postData); // Post 상태 업데이트
        setApplicants(
          postData.applicants ? Object.values(postData.applicants) : []
        ); // 신청자 목록 상태에 저장
      } else {
        setPost(null); // 신청자가 없을 경우 빈 배열로 초기화
      }
      setLoading(false);
    });

    //cleanup : 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
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

    const applicantId = `${nickname}_${Date.now()}`;
    const newApplicant = {
      nickname,
      contact,
      memo,
      status: "pending",
    };

    // firebase에 업데이트하는 부분 수정
    const postRef = ref(database, `posts/${id}`);
    update(postRef, {
      [`applicants/${applicantId}`]: newApplicant,
    })
      .then(() => {
        setApplicationStatus("신청이 완료되었습니다!");
        setApplying(false); // 모달 닫기
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

      {post.applicants && (
        <div className="applicants-container">
          <h3>참여하고 싶어요!</h3>
          <div className="applicants-grid">
            {applicants.map((applicant, index) => (
              <div key={index} className="applicant-card">
                <p>
                  <strong>닉네임:</strong> {applicant.nickname}
                </p>
                <p>
                  <strong>연락처:</strong> {applicant.contact}
                </p>
                <p>
                  <strong>메모:</strong> {applicant.memo}
                </p>
                <p>
                  <strong>상태:</strong> {applicant.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;
