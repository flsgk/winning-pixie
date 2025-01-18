// PostDetail.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get, update, onValue, set, getDatabase } from "firebase/database";
import { database } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Button,
  Box,
  Typography,
  Card,
  Modal,
  ModalClose,
  ModalDialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Stack,
  Textarea,
  Chip,
  Divider,
} from "@mui/joy";
import GoBackButton from "./GoBackButton";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [post, setPost] = useState(null); // 현재 게시물 정보를 저장
  const [loading, setLoading] = useState(true); // 데이터 로딩 여부를 확인
  const [applying, setApplying] = useState(false); // 사용자의 참가 신청 상태
  const [formData, setFormData] = useState({
    nickname: "",
    memo: "",
    team: "",
  });

  const [editData, setEditData] = useState({
    nickname: "",
    memo: "",
    team: "",
  });

  const [applicants, setApplicants] = useState([]); // 해당 게시물에 참가 신청한 사람들의 정보
  const [isApplicant, setIsApplicant] = useState(false); // 사용자가 이미 참가 신청을 했는지
  const [isEdit, setIsEdit] = useState(false);
  const [postStatus, setPostStatus] = useState("");

  // 사용자 정보 가져오기 : 유저가 로그인한 상태에서 유저 닉네임을 가져와서 formData에 업데이트하기
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setFormData((prevData) => ({
            ...prevData,
            nickname: userData.nickname || "",
          }));
        }
      });
    }
  }, [auth]);

  // 게시물 정보 가져오기
  useEffect(() => {
    const postRef = ref(database, `posts/${id}`);
    const unsubscribe = onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const postData = snapshot.val();
        setPost(postData); // 게시물 정보 상태 업데이트
        const applicantsList = postData.applicants
          ? Object.values(postData.applicants)
          : []; // 신청자 목록을 가져와서
        console.log("신청자 정보: ", applicants);
        setApplicants(applicantsList); // 신청자 목록 상태를 업데이트 한다

        // 이미 사용자가 신청했는지 여부를 업데이트
        const userIsApplicant = applicantsList.some(
          (applicant) => applicant.nickname === formData.nickname
        );
        setIsApplicant(userIsApplicant); // 현재 사용자가 신청했는지 여부 (신청자의 닉네임 = 현재 사용자의 닉네임이면 true)
      } else {
        setPost(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [id, formData.nickname]);

  // 신청 상태 확인
  const handleApply = async (e) => {
    e.preventDefault();
    const { nickname, team } = formData;
    if (!nickname || !team) {
      return;
    }

    if (isApplicant) {
      // 중복 신청 방지
      return;
    }

    const applicantId = currentUser.uid; // Firebase의 UID를 사용

    const newApplicant = {
      nickname,
      uid: applicantId,
      memo: formData.memo,
      team,
      status: "pending",
    };
    const postRef = ref(database, `posts/${id}`);

    try {
      await update(postRef, { [`applicants/${applicantId}`]: newApplicant }); // 참가자 정보 추가하기
      setApplying(false); // 모달 닫기
      setIsApplicant(true); // 참가 완료 상태로 업데이트

      // 로컬 스토리지에 신청 상태 저장하기
      localStorage.setItem(`applicant_${id}`, JSON.stringify(newApplicant)); // 자바스크립트 객체를 JSON 문자열로 변환
    } catch (error) {}
  };

  useEffect(() => {
    if (!currentUser) {
      console.log("사용자 정보가 로드되지 않았습니다.");
      return; // currentUser가 없으면 함수 종료
    }

    console.log("id 값:", id);
    console.log("uid 값:", currentUser.uid);

    const postRef = ref(database, `posts/${id}/applicants/${currentUser.uid}`);
    const unsubscribe = onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("불러온 데이터:", userData); // 콘솔로 데이터 확인
        setEditData(userData);
      } else {
        console.log("사용자 데이터 로드 실패");
      }
    });

    return () => unsubscribe(); // 효과가 종료될 때 리스너 제거
  }, [id, currentUser]); // currentUser가 변경될 때마다 다시 실행

  // 입력 필드 수정 처리
  const handleEdit = async (e) => {
    e.preventDefault();

    const { nickname, team } = editData;

    console.log(isApplicant); // 상태 값 확인
    console.log(editData.nickname, editData.team); // 값을 확인
    console.log(currentUser); // currentUser 객체 확인

    if (!nickname || !team || !isApplicant) {
      return;
    }

    const applicantId = currentUser.uid; // Firebase의 UID를 사용

    const editApplicant = {
      nickname,
      uid: applicantId, // 참가자의 UID 추가
      memo: editData.memo,
      team: editData.team,
      status: "pending",
    };
    const postRef = ref(database, `posts/${id}/applicants/${applicantId}`);
    console.log(postRef); // 경로 확인

    try {
      await update(postRef, editApplicant); // 참가자 정보 추가하기
      setIsEdit(false); // 모달 닫기
      setIsApplicant(true); // 참가 완료 상태로 업데이트

      // 로컬 스토리지에 신청 상태 저장하기
      localStorage.setItem(`applicant_${id}`, JSON.stringify(editApplicant)); // 자바스크립트 객체를 JSON 문자열로 변환
    } catch (error) {}
  };

  useEffect(() => {
    // 로컬 스토리지에서 상태 불러오기
    const storedApplicant = localStorage.getItem(`applicant_${id}`);
    if (storedApplicant) {
      const applicantData = JSON.parse(storedApplicant);
      setIsApplicant(true); // 이미 신청했으면 신청 상태로 설정
      setFormData((prevData) => ({
        ...prevData,
        nickname: applicantData.nickname,
        team: applicantData.team,
        memo: applicantData.memo,
      }));
    } else {
      // 로컬 스토리지에 없으면 Firebase에서 확인
      const postRef = ref(database, `posts/${id}`);
      const unsubscribe = onValue(postRef, (snapshot) => {
        if (snapshot.exists()) {
          const postData = snapshot.val();
          const applicantsList = postData.applicants
            ? Object.values(postData.applicants)
            : [];
          setApplicants(applicantsList);

          const userIsApplicant = applicantsList.some(
            (applicant) => applicant.nickname === formData.nickname
          );
          setIsApplicant(userIsApplicant);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [id, formData.nickname]); // id와 nickname이 바뀔 때마다 상태 업데이트

  // 채팅방 처리
  const handleChat = async (applicant, index) => {
    console.log("Index1: ", index);
    try {
      const postRef = ref(database, `posts/${id}`);
      const applicantRoomId = applicant.roomId; // 신청자의 채팅방 ID

      if (applicantRoomId) {
        navigate(`/post/${id}/chat/${applicantRoomId}`); // 이미 채팅방이 있다면 해당 채팅방으로 이동
      } else if (post.uid === auth.currentUser?.uid) {
        // 게시물 작성자라면 채팅방 생성 가능
        const newRoomKey = Date.now().toString();
        const chatRoomRef = ref(database, `chatRooms/${newRoomKey}`);
        const newChatRoom = {
          roomId: newRoomKey,
          authorUid: auth.currentUser?.uid,
          applicantUid: applicant.nickname,
          authorNickname: post.authorNickname,
          postId: id,
          messages: [],
          createdAt: new Date().toISOString(),
        };

        await set(chatRoomRef, newChatRoom); // 새로운 채팅방 생성
        const updatedApplicant = { ...applicant, roomId: newRoomKey }; // 신청자 정보에도 채팅방 id 추가
        await update(postRef, {
          [`applicants/${Object.keys(post.applicants)[index]}`]:
            updatedApplicant,
        });
        navigate(`/post/${id}/chat/${newRoomKey}`); // 생성된 채팅방으로 이동
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };
  const handleStatus = async (applicant, index) => {
    console.log("Index2: ", index);
    try {
      const postRef = ref(database, `posts/${id}`);
      const applicantStatus = applicant.status;

      // applicantStatus가 "accepted" 또는 "pending" 값만을 가지는지 확인
      if (applicantStatus === "accepted" || applicantStatus === "pending") {
        const newStatus =
          applicantStatus === "accepted" ? "pending" : "accepted";
        await update(postRef, {
          [`applicants/${Object.keys(post.applicants)[index]}/status`]:
            newStatus,
        });

        onValue(postRef, (snapshot) => {
          const postData = snapshot.val();
          setPost(postData); // 버튼을 누름에 따라 게시글의 status가 변경될 경우 UI에 반영
        });
      }
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!post) return <p>글을 찾을 수 없습니다.</p>;

  const isAuthor = post?.uid === auth.currentUser?.uid;
  const applicantCount = post.applicants
    ? Object.keys(post.applicants).length
    : 0;

  let acceptedCount = 0; // 변수 선언 및 초기값 0으로 설정

  const acceptedStatusCount = Object.values(post.applicants).forEach(
    // Object.values : 객체의 모든 값을 배열로 변환
    (applicant) => {
      if (applicant.status === "accepted") {
        acceptedCount++;
      }
    }
  );

  const newStatus = acceptedCount === post.capacity ? "모집 완료" : "모집 중";
  const postRef = ref(database, `posts/${id}`);

  const updatedPost = {
    ...post,
    status: newStatus, // 상태를 '모집 완료'로 변경
  };
  update(postRef, updatedPost);

  console.log("accepted count:", acceptedCount); // 'accepted' 상태인 applicants의 개수 출력

  return (
    <Box>
      <GoBackButton />
      <Card sx={{ width: 500 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Chip
            color={post.status === "모집 중" ? "success" : "neutral"}
            sx={{
              mr: "5px",
            }}
          >
            {post.status}
          </Chip>
          <Chip>{post.yourTeam}</Chip>
        </Box>
        <Typography level="h2">{post.title}</Typography>

        <Typography
          level="body-xs"
          sx={{
            display: "flex", // 아이콘과 글씨를 한 줄로 정렬
            alignItems: "center", // 글씨를 세로로 맞춰서 정렬
            gap: "4px",
          }} // 아이콘과 글씨 사이에 간격 주기
        >
          <CalendarMonthRoundedIcon
            sx={{ fontSize: "1rem", marginRight: "4px" }}
          />
          {new Date(post.playDate).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>

        <Typography
          level="body-xs"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <AccountCircleRoundedIcon
            sx={{ fontSize: "1rem", marginRight: "4px" }}
          />
          {post.authorNickname}님
        </Typography>

        <Typography
          level="body-xs"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <PeopleRoundedIcon sx={{ fontSize: "1rem", marginRight: "4px" }} />
          참여 중인 인원 {applicantCount}/{post.capacity}
        </Typography>

        <Typography
          level="body-xs"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FavoriteRoundedIcon sx={{ fontSize: "1rem", marginRight: "4px" }} />{" "}
          {post.yourTeam} 팀의 승리요정을 찾고 있어요!
        </Typography>
        <Divider />
        <div dangerouslySetInnerHTML={{ __html: post.content }} />

        <Divider />
        {isAuthor ? (
          <Button onClick={() => navigate(`/edit/${id}`)}>편집하기</Button>
        ) : (
          !isApplicant &&
          !applying && (
            <Button onClick={() => setApplying(true)}>참여하기</Button>
          )
        )}

        {isApplicant && <Button disabled>참여 완료</Button>}
      </Card>

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
            <form onSubmit={handleApply}>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>닉네임</FormLabel>
                  <Input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    disabled
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>메모(선택)</FormLabel>
                  <Textarea
                    name="memo"
                    value={formData.memo}
                    onChange={(e) =>
                      setFormData({ ...formData, memo: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>응원하는 팀</FormLabel>
                  <Select
                    name="team"
                    value={formData.team}
                    onChange={(e, newValue) =>
                      setFormData({ ...formData, team: newValue })
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
          </ModalDialog>
        </Modal>
      )}

      {isEdit && (
        <Modal
          open={isEdit}
          onClose={() => setIsEdit(false)}
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
              onClick={() => setIsEdit(false)}
            />
            <DialogTitle>참여 신청</DialogTitle>
            <DialogContent> 요정님의 정보를 입력해주세요.</DialogContent>
            <form onSubmit={handleEdit}>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>닉네임</FormLabel>
                  <Input
                    type="text"
                    name="nickname"
                    value={editData.nickname}
                    disabled
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>메모(선택)</FormLabel>
                  <Textarea
                    name="memo"
                    value={editData.memo}
                    onChange={(e) =>
                      setEditData({ ...editData, memo: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>응원하는 팀</FormLabel>
                  <Select
                    name="team"
                    value={editData.team}
                    onChange={(e, newValue) =>
                      setEditData({ ...editData, team: newValue })
                    }
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

                <Button type="submit">수정하기</Button>
              </Stack>
            </form>
          </ModalDialog>
        </Modal>
      )}

      {post.applicants && (
        <Box sx={{ marginTop: 2 }}>
          <Typography level="h3">참여하고 싶어요!</Typography>
          <Stack spacing={2} sx={{ width: 300 }}>
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
                <Chip
                  color={
                    applicant.status === "accepted" ? "success" : "neutral"
                  }
                >
                  {applicant.status}
                </Chip>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                  {isAuthor && (
                    <Button
                      onClick={() => handleStatus(applicant, index)}
                      sx={{
                        width: "80px",
                        fontSize: "10px",
                      }}
                    >
                      {applicant.status === "accepted" ? "수락 취소" : "수락"}
                    </Button>
                  )}
                  {!isAuthor && applicant.nickname === formData.nickname && (
                    <Button
                      disabled={applicant.status === "종료"}
                      onClick={() => setIsEdit(true)}
                      sx={{
                        width: "80px",
                        fontSize: "10px",
                      }}
                    >
                      수정하기
                    </Button>
                  )}

                  {isAuthor ? (
                    <Button
                      onClick={() => handleChat(applicant, index)}
                      sx={{
                        width: "100px",
                        fontSize: "10px",
                      }}
                    >
                      {applicant.roomId ? "채팅 이동하기" : "채팅하기"}
                    </Button>
                  ) : (
                    applicant.nickname === formData.nickname &&
                    applicant.roomId && (
                      <Button
                        disabled={applicant.status === "종료"}
                        onClick={() => handleChat(applicant, index)}
                        sx={{
                          width: "100px",
                          fontSize: "10px",
                        }}
                      >
                        {applicant.status !== "종료"
                          ? "채팅 이동하기"
                          : "다음에 만나요"}
                      </Button>
                    )
                  )}
                </Box>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default PostDetail;
