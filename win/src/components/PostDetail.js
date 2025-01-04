import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ref, get, update, onValue, set } from "firebase/database";
import { database } from "../firebase";

import { getAuth } from "firebase/auth";
import "./CSS/PostDetail.css";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Card from "@mui/joy/Card";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import {
  Chip,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  ModalDialog,
  Option,
  Select,
  Stack,
  Textarea,
} from "@mui/joy";
import GoBackButton from "./GoBackButton";
import Chat from "./Chat";
import { useNavigate } from "react-router-dom";

function PostDetail() {
  const { id } = useParams(); // URL에서 ID 가져오기
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false); // 모달폼 표시 상태
  const [formData, setFormData] = useState({
    nickname: "",
    memo: "",
    team: "choice",
  });
  const [applicationStatus, setApplicationStatus] = useState(""); // 폼 제출 상태
  const [applicants, setApplicants] = useState([]); // 신청자 목록 상태 관리
  const [roomId, setRoomId] = useState(null); // 채팅방 ID
  const [isApplicant, setIsApplicant] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();

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
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nickname, memo, team } = formData;
    if (!nickname || !team || team === "choice") {
      setApplicationStatus("팀을 선택해주세요.");
      return;
    }

    const applicantId = `${nickname}_${Date.now()}`;
    const newApplicant = {
      nickname,
      memo,
      team,
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

  // 글 작성자 UID와 현재 로그인된 UID 비교
  const isAuthor = post && post.uid === auth.currentUser?.uid;

  // 채팅 방 생성 (클릭 시 chatRooms 경로에 새로운 채팅 방을 추가)
  const handleChat = async (applicant, index) => {
    try {
      const authorUid = auth.currentUser?.uid;
      const applicantUid = applicant.nickname;
      const postRef = ref(database, `posts/${id}`);

      // 0. 이미 채팅방이 있는지 확인
      const applicantRoomId = applicant.roomId;

      if (applicantRoomId) {
        navigate(`chat/${applicantRoomId}`);
      } else {
        if (isAuthor) {
          // 1. 새로운 채팅 방 생성
          const newRoomKey = Date.now().toString(); // 고유한 채팅 방의 키를 생성
          const chatRoomRef = ref(database, `chatRooms/${newRoomKey}`);

          const newChatRoom = {
            roomId: newRoomKey,
            authorUid,
            applicantUid,
            postId: id,
            messages: [],
            createdAt: new Date().toISOString(),
          };
          await set(chatRoomRef, newChatRoom); // firebase에 채팅 방 추가

          // 3. 신청자 데이터 업데이트
          const updatedApplicant = {
            ...applicant,
            roomId: newRoomKey, // 신청자 데이터에 roomId를 추가해서 업데이트 하는 것
          };
          await update(postRef, {
            [`applicants/${Object.keys(post.applicants)[index]}`]:
              updatedApplicant,
          });

          // 4. 채팅 방으로 이동
          navigate(`/chat/${newRoomKey}`);
        }
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  return (
    <Box>
      <GoBackButton />

      <Card sx={{ width: 500 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography level="h2">{post.title}</Typography>

          <Typography level="body-xs">작성일: {post.createdDate}</Typography>
        </Box>

        <div dangerouslySetInnerHTML={{ __html: post.content }}></div>

        <Typography level="body-sm">
          경기일 :
          {new Date(post.playDate).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
        <Typography level="body-sm">
          {post.yourTeam}의 승리요정을 찾고 있어요!
        </Typography>

        {/* 글 작성자는 편집하기 버튼 */}
        {isAuthor ? (
          <Button>편집하기</Button>
        ) : (
          // 참여하기 버튼은 작성자가 아닐 경우만
          !applying &&
          !applicationStatus && (
            <Button onClick={() => setApplying(true)}>참여하기</Button>
          )
        )}

        {/* 신청이 완료되면 버튼 텍스트 변경 */}
        {applicationStatus === "신청이 완료되었습니다!" && (
          <Button disabled>참여 완료</Button>
        )}
      </Card>

      {/* 모달 */}
      {applying && (
        <Modal
          open={applying}
          onClose={() => setApplying(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ModalDialog>
            <ModalClose
              variant="plain"
              sx={{ m: 1 }}
              onClick={() => setApplying(false)}
            />
            <DialogTitle>참여 신청</DialogTitle>
            <DialogContent> 요정님의 정보를 입력해주세요.</DialogContent>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>닉네임</FormLabel>
                  <Input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    disabled
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>메모(선택)</FormLabel>
                  <Textarea
                    name="memo"
                    value={formData.memo}
                    onChange={handleChange}
                    placeholder="메모를 입력하세요"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>응원하는 팀</FormLabel>
                  <Select
                    name="team"
                    value={formData.team}
                    onChange={(e, newValue) =>
                      setFormData((prev) => ({ ...prev, team: newValue }))
                    }
                    placeholder="선택"
                  >
                    <Option value="두산">두산</Option>
                    <Option value="LG">LG</Option>
                    <Option value="KIA">KIA</Option>
                    <Option value="NC">NC</Option>
                    <Option value="KT">KT</Option>
                    <Option value="한화">한화</Option>
                    <Option value="삼성">삼성</Option>
                    <Option value="키움">키움</Option>
                    <Option value="SSG">SSG</Option>
                    <Option value="롯데">롯데</Option>
                  </Select>
                </FormControl>

                <Button type="submit">신청하기</Button>
              </Stack>
            </form>
            {applicationStatus && <p>{applicationStatus}</p>}
          </ModalDialog>
        </Modal>
      )}

      {post.applicants && (
        <Box sx={{ marginTop: 2 }}>
          <Typography level="h3">참여하고 싶어요!</Typography>
          <Stack spacing={2} sx={{ width: 200 }}>
            {applicants.map((applicant, index) => (
              <Card key={index} className="applicant-card">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography level="body-sm">
                    {applicant.nickname} 요정님
                  </Typography>
                  <Chip color="primary">{applicant.team}</Chip>
                </Box>
                <Typography level="body-sm">{applicant.memo}</Typography>
                <Chip>{applicant.status}</Chip>
                {/* 버튼 추가 */}

                {isAuthor ? (
                  <Button
                    onClick={() => handleChat(applicant, index)} // 핸들러 연결
                  >
                    {applicant.roomId ? "채팅 이동하기" : "채팅하기"}
                  </Button>
                ) : (
                  applicant.nickname === formData.nickname &&
                  applicant.roomId && ( // 채팅방이 있는 경우에만 참여자가 채팅방 입장 버튼을 볼 수 있도록 하기
                    <Button onClick={() => handleChat(applicant, index)}>
                      채팅 이동하기
                    </Button>
                  )
                )}
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default PostDetail;
