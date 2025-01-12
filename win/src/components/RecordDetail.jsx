import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { database } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { Box, Typography } from "@mui/joy";
import GoBackButton from "./GoBackButton";

const RecordDetail = ({ selectedTeam }) => {
  const { date } = useParams();
  const auth = getAuth();

  const [post, setPost] = useState(null);
  const [userId, setUserId] = useState(null);

  // Firebase 인증 상태를 확인하여 userId 설정
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log("로그인되지 않은 사용자");
      }
    });
    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 제거
  }, [auth]);

  useEffect(() => {
    if (!userId) {
      console.log("사용자 정보가 로드되지 않았습니다.");
      return; // currentUser가 없으면 함수 종료
    }
    const postRef = ref(
      database,
      `users/${userId}/records/${selectedTeam}/${date}`
    );

    const unsubscribe = onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const postData = snapshot.val();
        console.log("Fetched Post:", postData);
        setPost(postData);
      } else {
        console.log("기록이 존재하지 않습니다.");
      }
    });
    return () => unsubscribe();
  }, [userId, selectedTeam, date]);

  return (
    <Box>
      <GoBackButton />
      {post ? (
        <div dangerouslySetInnerHTML={{ __html: post.diary }} />
      ) : (
        <Typography>기록을 불러오는 중입니다...</Typography> // post가 없으면 로딩 상태 표시
      )}
    </Box>
  );
};

export default RecordDetail;
