import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ref,
  onValue,
  serverTimestamp,
  push,
  off,
  update,
} from "firebase/database";
import { auth, database } from "../firebase";
import { io } from "socket.io-client";
import {
  Sheet,
  Box,
  FormControl,
  Textarea,
  Button,
  Stack,
  Typography,
  Divider,
  Chip,
} from "@mui/joy";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import GoBackButton from "./GoBackButton";

const socket = io("http://localhost:4000"); // 서버와 웹소켓 통신 설정, 여기에서 4000번 포트를 확인

const ChatRoom = () => {
  const { roomId } = useParams();
  console.log(roomId); // roomId 값 확인
  const { id } = useParams(); // URL에서 ID 가져오기

  const [messages, setMessages] = useState([]); // 채팅 메시지 저장
  const [input, setInput] = useState(""); // 입력 중인 메시지
  const [currentUserId, setCurrentUserId] = useState(null); // 현재 사용자 Id
  const [chatRoomInfo, setChatRoomInfo] = useState(null); // 채팅방 정보
  const [gameInfo, setGameInfo] = useState(null); // 경기 정보

  // 유저 정보 가져오기
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 채팅방 입장 및 메시지 수신
  useEffect(() => {
    // 방에 입장
    socket.emit("join room", roomId);

    // 서버에서 메시지를 받는 이벤트
    socket.on("chat message", (msg) => {
      if (msg.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, msg]); // 해당 roomId에만 메시지 추가
      }
    });

    // 체팅방 정보 가져오기

    console.log(chatRoomInfo); // chatRoomInfo가 제대로 로드되었는지 확인
    const chatRoomRef = ref(database, `chatRooms/${roomId}`);
    onValue(chatRoomRef, (snapshot) => {
      if (snapshot.exists()) {
        setChatRoomInfo(snapshot.val());
      } else {
        console.error("채팅방 정보를 찾을 수 없습니다.");
      }
    });

    const gameInfoRef = ref(database, `posts/${id}`);
    onValue(gameInfoRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameInfo(snapshot.val());
      } else {
        console.error("게임 정보를 찾을 수 없습니다.");
      }
    });

    // 컴포넌트 언마운트 시 clean up
    return () => {
      socket.emit("leave room", roomId); // 채팅방을 떠날 때
      socket.off("chat message"); // 메시지 수신 이벤트 해제
      off(chatRoomRef);
      off(gameInfoRef);
    };
  }, [roomId]);

  // 메시지 전송
  const sendMessage = () => {
    if (input) {
      const user = auth.currentUser;

      if (user) {
        if (!chatRoomInfo) {
          console.error("채팅방 정보(chatRoomInfo)가 로드되지 않았습니다.");
          return; // chatRoomInfo가 null이면 실행하지 않음
        }
        const senderNickname =
          currentUserId === chatRoomInfo.authorUid
            ? chatRoomInfo.authorNickname
            : chatRoomInfo.applicantUid;

        const messageData = {
          roomId,
          text: input,
          sender: currentUserId,
          senderNickname: senderNickname,
          timestamp: serverTimestamp(), // 서버 시간 저장
        };

        // Firebase 데이터베이스에 저장
        const messageRef = ref(database, `chatRooms/${roomId}/messages`);
        push(messageRef, messageData);

        socket.emit("chat message", messageData); // 서버로 입력한 값을 전송
        setInput("");
      }
    }
  };

  // 채팅방에서 메시지 가져오기
  useEffect(() => {
    const messageRef = ref(database, `chatRooms/${roomId}/messages`);
    onValue(messageRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        setMessages(Object.values(messagesData));
      }
    });
    return () => {
      off(messageRef);
    };
  }, [roomId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input) {
      sendMessage();
    }
  };

  // 채팅 메시지 시간 표시
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return " ";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 유저 선택 상태 변경하기
  const handleUpdateParticipants = () => {
    // posts 경로에서 해당 포스트 데이터 가져오기
    const postRef = ref(database, `posts/${id}`);
    onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const postData = snapshot.val();
        const applicants = postData.applicants;

        const updates = {};
        for (let applicantId in applicants) {
          if (applicants[applicantId].nickname === chatRoomInfo.applicantUid) {
            updates[`posts/${id}/applicants/${applicantId}/status`] =
              "accepted"; // 선택된 참가자의 상태는 accepted로 설정
          } else {
            updates[`posts/${id}/applicants/${applicantId}/status`] = "종료"; // 나머지 참가자들의 상태는 종료로 설정
          }
        }

        // Firebase에서 상태 업데이트
        update(ref(database), updates)
          .then(() => {
            console.log("참가자 상태 업데이트 완료");
          })
          .catch((error) => {
            console.error("상태 업데이트 실패:", error);
          });
      } else {
        console.error("포스트를 찾을 수 없습니다.");
      }
    });
  };

  return (
    <Box sx={{ maxWidth: "60%", minWidth: "auto" }}>
      <GoBackButton />
      {gameInfo ? (
        <>
          <Typography level="h2">{gameInfo.title}</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
            <Chip>경기일</Chip>
            <Typography>
              {new Date(gameInfo.playDate).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Chip>채팅방 ID</Chip>
            <Typography>{roomId}</Typography>
          </Box>
          {currentUserId === chatRoomInfo.authorUid && (
            <Button onClick={handleUpdateParticipants}>같이 갈래요!</Button>
          )}
        </>
      ) : (
        <Typography>게임 정보를 불러오는 중...</Typography>
      )}

      <Divider />

      {messages.map((messageData, index) => (
        <Box
          sx={{
            marginBottom: 1, // 각 메시지 간의 세로 간격을 줄이기 위해 marginBottom을 추가
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems:
                messageData.sender === currentUserId
                  ? "flex-end"
                  : "flex-start",
            }}
            key={index}
          >
            <Typography>
              {messageData.sender === currentUserId
                ? "나"
                : messageData.senderNickname + "님"}
            </Typography>
            <Sheet
              sx={{
                p: 1.25,
                borderRadius: "lg",
                fontSize: "sm",

                textAlign:
                  messageData.sender === currentUserId ? "right" : "left",
                borderTopRightRadius:
                  messageData.sender === currentUserId ? 0 : "lg",
                borderTopLeftRadius:
                  messageData.sender === currentUserId ? "lg" : 0,
                backgroundColor:
                  messageData.sender === currentUserId
                    ? "var(--joy-palette-primary-solidBg)"
                    : "var(--joy-palette-neutral-100, #F0F4F8)",
                display: "inline-block", // 부모 요소의 크기가 자식의 콘텐츠에 맞춰 조정됨
                wordBreak: "break-word", // 긴 단어가 넘칠 경우 줄 바꿈
                maxWidth: "60%", // 메시지 길이에 맞게 최대 너비를 설정 (여기서는 70%로 설정, 필요에 따라 조정)
              }}
            >
              <Typography
                level="body-sm"
                sx={{
                  color:
                    messageData.sender === currentUserId
                      ? "var(--joy-palette-common-white)"
                      : "var(--joy-palette-text-primary)",
                }}
              >
                {messageData.text}
              </Typography>
            </Sheet>
            <Typography level="body-xs">
              {formatTimestamp(messageData.timestamp)}
            </Typography>
          </Box>
        </Box>
      ))}

      <Box>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <Textarea
              placeholder="메시지를 입력하세요"
              value={input}
              minRows={1}
              maxRows={2}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyDown}
              endDecorator={
                <Stack direction="row">
                  <Button
                    color="primary"
                    sx={{ alignSelf: "center", borderRadius: "sm" }}
                    endDecorator={<SendRoundedIcon />}
                    type="submit"
                  >
                    보내기
                  </Button>
                </Stack>
              }
            />
          </FormControl>
        </form>
      </Box>
    </Box>
  );
};

export default ChatRoom;
